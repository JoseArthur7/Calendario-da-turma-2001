(() => {
  const $ = (id) => document.getElementById(id);
  const ui = {
    connection: $("connection"),
    list: $("item-list"),
    listNote: $("list-note"),
    publicMessage: $("public-message"),
    suggestForm: $("suggest-form"),
    suggestMessage: $("suggest-message"),
    reserveDialog: $("reserve-dialog"),
    reserveForm: $("reserve-form"),
    reserveTitle: $("reserve-title"),
    reserveCount: $("reserve-count"),
    reserveMessage: $("reserve-message"),
    adminOpen: $("admin-open"),
    adminArea: $("admin-area"),
    adminMessage: $("admin-message"),
    loginForm: $("login-form"),
    adminContent: $("admin-content"),
    adminLogout: $("admin-logout"),
    adminItems: $("admin-items"),
    adminSuggestions: $("admin-suggestions"),
    itemForm: $("item-form"),
    cancelEdit: $("cancel-edit"),
    acceptDialog: $("accept-dialog"),
    acceptForm: $("accept-form"),
    acceptTitle: $("accept-title"),
    acceptMessage: $("accept-message")
  };

  const config = window.LANCHE_CONFIG;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(config?.supabaseUrl ?? "") ||
      !/^sb_publishable_[\w-]+$/.test(config?.supabasePublishableKey ?? "") ||
      config.supabasePublishableKey.includes("COLE_SUA_CHAVE")) {
    ui.connection.textContent = "Configuração pendente";
    ui.listNote.textContent = "Preencha a URL e a chave pública no arquivo lanche-coletivo-config.js.";
    return;
  }
  if (!window.supabase?.createClient) {
    ui.connection.textContent = "Conexão indisponível";
    ui.listNote.textContent = "O serviço de conexão não carregou. Recarregue a página.";
    return;
  }

  const db = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: { persistSession: false, detectSessionInUrl: false }
  });
  const submit = (form) => form.querySelector('button[type="submit"]');
  let items = [];
  let reserveId = null;
  let reserveBusy = false;
  let hasLoaded = false;
  let realtime = false;
  let refreshing = false;
  let refreshAgain = false;
  let admin = false;
  let adminBusy = false;
  let adminRequest = 0;
  let editingItemId = null;
  let suggestionId = null;

  function message(node, text = "", isError = false) {
    node.textContent = text;
    node.classList.toggle("error", isError);
  }

  function explain(error, fallback) {
    if (error?.code === "P0001") return error.message;
    if (error?.code === "23505") return "Já existe um item com esse nome na lista.";
    if (error?.code === "42501") return "Esta conta não tem acesso de administrador.";
    return fallback;
  }

  async function rpc(name, parameters) {
    const { data, error } = await db.rpc(name, parameters);
    if (error) throw error;
    return data;
  }

  function renderItems() {
    const focusedItem = document.activeElement?.dataset.itemId;
    const rows = document.createDocumentFragment();
    items.forEach((item, index) => {
      const row = $("item-template").content.firstElementChild.cloneNode(true);
      const left = item.limite - item.ocupadas;
      row.classList.toggle("full", left === 0);
      row.querySelector(".item-number").textContent = String(index + 1).padStart(2, "0");
      row.querySelector("h3").textContent = item.nome;
      row.querySelector(".item-count").textContent = item.ocupadas + " de " + item.limite + " ocupadas";
      row.querySelector(".meter span").style.width = (100 * item.ocupadas / item.limite) + "%";
      const names = item.nomes ?? [];
      row.querySelector(".item-reservations").hidden = names.length === 0;
      const nameList = row.querySelector(".participant-names");
      nameList.setAttribute("aria-label", "Pessoas que vão levar " + item.nome);
      for (const name of names) {
        nameList.append(makeElement("li", name));
      }
      const button = row.querySelector("button");
      button.dataset.itemId = item.id;
      button.disabled = left === 0;
      button.textContent = left === 0 ? "Lotado" : "Reservar";
      button.setAttribute("aria-label", button.textContent + " · " + item.nome);
      button.addEventListener("click", () => openReservation(item.id));
      rows.append(row);
    });
    ui.list.replaceChildren(rows);
    if (focusedItem) {
      const nextButton = [...ui.list.querySelectorAll("button")].find(button => button.dataset.itemId === focusedItem);
      if (nextButton && !nextButton.disabled) nextButton.focus({ preventScroll: true });
    }
    ui.listNote.hidden = items.length > 0;
    ui.listNote.textContent = "A lista ainda está vazia. Volte depois ou envie uma sugestão.";
    updateReservation();
  }

  function renderConnection(text) {
    ui.connection.textContent = text;
    ui.connection.classList.toggle("live", text === "Ao vivo");
  }

  async function refreshItems() {
    if (refreshing) {
      refreshAgain = true;
      return;
    }
    refreshing = true;
    try {
      do {
        refreshAgain = false;
        try {
          const data = await rpc("lanche_lista");
          hasLoaded = true;
          const changed = JSON.stringify(items) !== JSON.stringify(data);
          items = data;
          if (changed || !ui.list.children.length) renderItems();
          if (items.length) ui.listNote.hidden = true;
          renderConnection(realtime ? "Ao vivo" : "Verificando vagas");
        } catch {
          renderConnection("Conexão indisponível");
          ui.listNote.hidden = false;
          ui.listNote.textContent = hasLoaded
            ? "A lista pode estar desatualizada. Tentaremos reconectar."
            : "Não foi possível carregar as vagas. Confira a conexão ou tente de novo em instantes.";
        }
      } while (refreshAgain);
    } finally {
      refreshing = false;
    }
  }

  function updateReservation() {
    if (!ui.reserveDialog.open) return;
    const item = items.find((entry) => entry.id === reserveId);
    const left = item ? item.limite - item.ocupadas : 0;
    if (item) ui.reserveTitle.textContent = item.nome;
    ui.reserveCount.textContent = !item ? "Este item saiu da lista."
      : left === 0 ? "Todas as vagas foram preenchidas."
      : left === 1 ? "Resta 1 vaga." : "Restam " + left + " vagas.";
    submit(ui.reserveForm).disabled = reserveBusy || left === 0;
    $("reserve-cancel").disabled = reserveBusy;
  }

  function openReservation(id) {
    reserveId = id;
    ui.reserveForm.reset();
    message(ui.reserveMessage);
    message(ui.publicMessage);
    ui.reserveTitle.textContent = items.find((item) => item.id === id)?.nome ?? "";
    ui.reserveDialog.showModal();
    updateReservation();
    ui.reserveForm.elements.person.focus();
  }

  $("reserve-cancel").addEventListener("click", () => ui.reserveDialog.close());
  ui.reserveDialog.addEventListener("cancel", (event) => {
    if (reserveBusy) event.preventDefault();
  });
  ui.reserveForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (reserveBusy || submit(ui.reserveForm).disabled) return;
    reserveBusy = true;
    message(ui.reserveMessage);
    updateReservation();
    const label = ui.reserveTitle.textContent;
    try {
      await rpc("lanche_reservar", { p_item_id: reserveId, p_nome: ui.reserveForm.elements.person.value });
      ui.reserveDialog.close();
      message(ui.publicMessage, "Vaga reservada para levar " + label + "!");
    } catch (error) {
      message(ui.reserveMessage, explain(error, "Não foi possível confirmar. Tente novamente."), true);
    } finally {
      await refreshItems();
      reserveBusy = false;
      updateReservation();
    }
  });

  ui.suggestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = submit(ui.suggestForm);
    if (button.disabled) return;
    button.disabled = true;
    message(ui.suggestMessage);
    try {
      await rpc("lanche_sugerir", { p_nome: ui.suggestForm.elements.namedItem("item").value });
      ui.suggestForm.reset();
      message(ui.suggestMessage, "Sugestão registrada. Valeu!");
      if (admin && !ui.adminArea.hidden) void refreshAdmin();
    } catch (error) {
      message(ui.suggestMessage, explain(error, "Não foi possível enviar a sugestão. Tente novamente."), true);
    } finally {
      button.disabled = false;
    }
  });

  function makeElement(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function action(label, click, danger = false) {
    const button = makeElement("button", label, danger ? "secondary danger" : "secondary");
    button.type = "button";
    button.addEventListener("click", click);
    return button;
  }

  function resetEditor() {
    editingItemId = null;
    ui.itemForm.reset();
    submit(ui.itemForm).textContent = "Criar item";
    ui.cancelEdit.hidden = true;
  }

  function editItem(item) {
    editingItemId = item.id;
    ui.itemForm.elements.namedItem("item").value = item.nome;
    ui.itemForm.elements.limit.value = item.limite;
    submit(ui.itemForm).textContent = "Salvar mudanças";
    ui.cancelEdit.hidden = false;
    ui.itemForm.elements.namedItem("item").focus();
  }

  function renderAdmin(data) {
    const itemNodes = document.createDocumentFragment();
    const suggestionNodes = document.createDocumentFragment();

    for (const item of data.itens) {
      const row = makeElement("div", "", "admin-row");
      const actions = makeElement("div", "", "actions");
      actions.append(
        action("Editar", () => editItem(item)),
        action("Remover item", () => {
          if (!window.confirm("Remover “" + item.nome + "” e todas as reservas desse item?")) return;
          void adminTask("lanche_admin_remover_item", { p_item_id: item.id }, "Item removido.", () => {
            if (editingItemId === item.id) resetEditor();
          });
        }, true)
      );
      row.append(makeElement("strong", item.nome + " · " + item.ocupadas + "/" + item.limite), actions);
      const reservations = data.reservas.filter((entry) => entry.item_id === item.id);
      if (reservations.length) {
        const list = makeElement("ul", "", "reservation-list");
        for (const entry of reservations) {
          const line = makeElement("li");
          const remove = action("Liberar vaga", () => {
            if (!window.confirm("Remover a reserva de “" + entry.nome + "”?")) return;
            void adminTask("lanche_admin_remover_reserva", {
              p_item_id: item.id, p_reserva_id: entry.id
            }, "Reserva removida. A vaga voltou à lista.");
          }, true);
          line.append(makeElement("span", entry.nome), remove);
          list.append(line);
        }
        row.append(list);
      }
      itemNodes.append(row);
    }
    for (const suggestion of data.sugestoes) {
      const row = makeElement("div", "", "admin-row");
      const actions = makeElement("div", "", "actions");
      actions.append(
        action("Aceitar", () => {
          suggestionId = suggestion.id;
          ui.acceptForm.reset();
          ui.acceptTitle.textContent = suggestion.nome;
          message(ui.acceptMessage);
          ui.acceptDialog.showModal();
        }),
        action("Apagar", () => {
          if (!window.confirm("Apagar a sugestão “" + suggestion.nome + "”?")) return;
          void adminTask("lanche_admin_revisar_sugestao", {
            p_sugestao_id: suggestion.id, p_limite: null
          }, "Sugestão apagada.");
        }, true)
      );
      row.append(makeElement("strong", suggestion.nome), actions);
      suggestionNodes.append(row);
    }
    if (!data.itens.length) itemNodes.append(makeElement("p", "Crie o primeiro item acima.", "notice"));
    if (!data.sugestoes.length) suggestionNodes.append(makeElement("p", "Nenhuma sugestão pendente.", "notice"));
    ui.adminItems.replaceChildren(itemNodes);
    ui.adminSuggestions.replaceChildren(suggestionNodes);
  }

  function setAdmin(signedIn) {
    admin = signedIn;
    ui.loginForm.hidden = signedIn;
    ui.adminContent.hidden = !signedIn;
    ui.adminLogout.hidden = !signedIn;
    if (!signedIn) {
      adminRequest++;
      ui.adminItems.replaceChildren();
      ui.adminSuggestions.replaceChildren();
      if (ui.acceptDialog.open) ui.acceptDialog.close();
      resetEditor();
    }
  }

  async function refreshAdmin() {
    if (!admin) return;
    const request = ++adminRequest;
    try {
      const data = await rpc("lanche_admin_dados");
      if (admin && request === adminRequest) renderAdmin(data);
    } catch (error) {
      if (!admin || request !== adminRequest) return;
      if (error?.code === "42501") {
        setAdmin(false);
        await db.auth.signOut({ scope: "local" }).catch(() => {});
      }
      message(ui.adminMessage, explain(error, "Não foi possível atualizar o painel."), true);
    }
  }

  async function adminTask(name, params, success, onSuccess, errorNode = ui.adminMessage) {
    if (!admin || adminBusy) return;
    adminBusy = true;
    ui.adminContent.inert = true;
    ui.adminLogout.disabled = true;
    submit(ui.acceptForm).disabled = true;
    $("accept-cancel").disabled = true;
    message(ui.adminMessage);
    if (errorNode !== ui.adminMessage) message(errorNode);
    try {
      await rpc(name, params);
      onSuccess?.();
      message(ui.adminMessage, success);
      await Promise.all([refreshItems(), refreshAdmin()]);
    } catch (error) {
      message(errorNode, explain(error, "Não foi possível salvar. Tente novamente."), true);
    } finally {
      adminBusy = false;
      ui.adminContent.inert = false;
      ui.adminLogout.disabled = false;
      submit(ui.acceptForm).disabled = false;
      $("accept-cancel").disabled = false;
    }
  }

  ui.adminOpen.addEventListener("click", () => {
    ui.adminArea.hidden = !ui.adminArea.hidden;
    ui.adminOpen.setAttribute("aria-expanded", String(!ui.adminArea.hidden));
    if (!ui.adminArea.hidden) {
      if (admin) void refreshAdmin();
      ui.adminArea.scrollIntoView({ block: "nearest" });
      if (!admin) ui.loginForm.elements.email.focus();
    }
  });

  ui.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = submit(ui.loginForm);
    if (button.disabled) return;
    button.disabled = true;
    message(ui.adminMessage);
    try {
      const { error } = await db.auth.signInWithPassword({
        email: ui.loginForm.elements.email.value.trim(),
        password: ui.loginForm.elements.password.value
      });
      if (error) throw error;
      const data = await rpc("lanche_admin_dados");
      renderAdmin(data);
      setAdmin(true);
      ui.itemForm.elements.namedItem("item").focus();
    } catch (error) {
      setAdmin(false);
      await db.auth.signOut({ scope: "local" }).catch(() => {});
      message(ui.adminMessage, explain(error, "Não foi possível entrar. Confira seu e-mail e sua senha."), true);
    } finally {
      ui.loginForm.elements.password.value = "";
      button.disabled = false;
    }
  });

  ui.adminLogout.addEventListener("click", async () => {
    if (adminBusy) return;
    ui.adminLogout.disabled = true;
    setAdmin(false);
    try {
      const { error } = await db.auth.signOut({ scope: "local" });
      if (error) throw error;
      message(ui.adminMessage, "Você saiu do painel.");
    } catch {
      message(ui.adminMessage, "Feche a página para encerrar a sessão.", true);
    } finally {
      ui.adminLogout.disabled = false;
    }
  });

  ui.itemForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const limit = ui.itemForm.elements.limit.valueAsNumber;
    void adminTask("lanche_admin_salvar_item", {
      p_item_id: editingItemId,
      p_nome: ui.itemForm.elements.namedItem("item").value,
      p_limite: limit
    }, editingItemId ? "Item atualizado." : "Item criado.", resetEditor);
  });
  ui.cancelEdit.addEventListener("click", resetEditor);
  $("admin-refresh").addEventListener("click", () => void refreshAdmin());
  $("accept-cancel").addEventListener("click", () => ui.acceptDialog.close());
  ui.acceptDialog.addEventListener("cancel", (event) => {
    if (adminBusy) event.preventDefault();
  });
  ui.acceptForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void adminTask("lanche_admin_revisar_sugestao", {
      p_sugestao_id: suggestionId, p_limite: ui.acceptForm.elements.limit.valueAsNumber
    }, "Sugestão aceita e incluída na lista.", () => ui.acceptDialog.close(), ui.acceptMessage);
  });

  ui.adminOpen.disabled = false;
  submit(ui.suggestForm).disabled = false;
  db.channel("lanche-vagas")
    .on("postgres_changes", { event: "*", schema: "public", table: "lanche_itens" }, () => {
      void refreshItems();
      if (admin && !ui.adminArea.hidden && !adminBusy) void refreshAdmin();
    })
    .subscribe((status) => {
      realtime = status === "SUBSCRIBED";
      renderConnection(realtime ? "Ao vivo" : "Verificando vagas");
      if (realtime) void refreshItems();
    });

  function refreshVisiblePage() {
    if (document.hidden) return;
    void refreshItems();
    if (admin && !ui.adminArea.hidden && !adminBusy) void refreshAdmin();
  }
  document.addEventListener("visibilitychange", refreshVisiblePage);
  window.addEventListener("online", refreshVisiblePage);
  window.setInterval(refreshVisiblePage, 30000);
  void refreshItems();
})();
