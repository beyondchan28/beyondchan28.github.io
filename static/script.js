    function addLineNumbers() {
        document.querySelectorAll(".code-content").forEach(code => {
            const lines = code.textContent.split("\n");
            const lineNumbers = code.parentElement.querySelector(".line-numbers");

            lineNumbers.innerHTML = lines
                .map((_, index) => index + 1)
                .join("<br>");
        });
    }

    function copyText(button) {
        const container = button.parentElement;
        const text = container.querySelector(".code-content").textContent;

        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);

        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);

        const success = document.execCommand("copy");

        document.body.removeChild(textarea);

        if (success) {
            button.textContent = "Copied!";

            setTimeout(() => {
                button.textContent = "Copy";
            }, 1500);
        } else {
            button.textContent = "Failed";

            setTimeout(() => {
                button.textContent = "Copy";
            }, 1500);
        }
    }

    addLineNumbers();