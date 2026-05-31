(function () {
  const password = "akai";
  const storageKey = "authenticated";

  function isAuthenticated() {
    try {
      return sessionStorage.getItem(storageKey) === "true";
    } catch (error) {
      return false;
    }
  }

  function rememberAuthentication() {
    try {
      sessionStorage.setItem(storageKey, "true");
    } catch (error) {
      // If storage is unavailable, keep the current page usable after login.
    }
  }

  function unlock(overlay) {
    rememberAuthentication();
    document.body.classList.remove("login-lock");
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
  }

  function buildLoginOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "login-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "login-title");

    overlay.innerHTML = `
      <section class="login-card">
        <h1 id="login-title">AKai Demo Preview</h1>
        <p>請輸入密碼以查看提案視覺頁面。</p>
        <form class="login-form" data-login-form>
          <label>
            Password
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              data-login-password
            />
          </label>
          <p class="login-error" data-login-error aria-live="polite"></p>
          <button type="submit">進入網站</button>
        </form>
      </section>
    `;

    document.body.appendChild(overlay);

    const form = overlay.querySelector("[data-login-form]");
    const input = overlay.querySelector("[data-login-password]");
    const error = overlay.querySelector("[data-login-error]");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (input.value === password) {
        unlock(overlay);
        return;
      }

      error.textContent = "密碼錯誤，請再試一次";
      input.select();
      input.focus();
    });

    document.body.classList.add("login-lock");
    input.focus();
  }

  if (isAuthenticated()) return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildLoginOverlay, { once: true });
  } else {
    buildLoginOverlay();
  }
})();
