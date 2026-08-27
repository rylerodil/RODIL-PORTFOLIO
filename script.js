/* =====================================================
   RYLEE RODIL PORTFOLIO
   FILE MANAGEMENT SYSTEM
===================================================== */

const DB_NAME = "RyleePortfolioDB";
const DB_VERSION = 1;
const STORE_NAME = "files";


/* =====================================================
   OPEN DATABASE
===================================================== */

function openDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );


        request.onupgradeneeded = function () {

            const database = request.result;

            if (
                !database.objectStoreNames.contains(
                    STORE_NAME
                )
            ) {

                database.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

            }

        };


        request.onsuccess = function () {

            resolve(request.result);

        };


        request.onerror = function () {

            reject(request.error);

        };

    });

}


/* =====================================================
   ADD FILE
===================================================== */

async function addFile(file, category) {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            store.add({

                name: file.name,

                type: file.type,

                size: file.size,

                category: category,

                blob: file,

                created: Date.now()

            });


            transaction.oncomplete =
                function () {

                    resolve();

                };


            transaction.onerror =
                function () {

                    reject(
                        transaction.error
                    );

                };

        }
    );

}


/* =====================================================
   GET FILES
===================================================== */

async function getFiles(category) {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    STORE_NAME,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            const request =
                store.getAll();


            request.onsuccess =
                function () {

                    const files =
                        request.result
                            .filter(
                                file =>
                                    file.category ===
                                    category
                            )
                            .sort(
                                (a, b) =>
                                    b.created -
                                    a.created
                            );


                    resolve(files);

                };


            request.onerror =
                function () {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* =====================================================
   DELETE FILE
===================================================== */

async function deleteFile(id) {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    STORE_NAME,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    STORE_NAME
                );


            store.delete(id);


            transaction.oncomplete =
                function () {

                    resolve();

                };


            transaction.onerror =
                function () {

                    reject(
                        transaction.error
                    );

                };

        }
    );

}
function viewQuizImage() {

    const modal = document.getElementById("fileModal");
    const title = document.getElementById("modalTitle");
    const content = document.getElementById("modalContent");

    title.textContent = "Quiz 1";

    content.innerHTML = `
        <img
            src="quiz1.png"
            alt="Quiz 1"
            style="
                width: 100%;
                max-height: 75vh;
                object-fit: contain;
                border-radius: 12px;
            "
        >
    `;

    modal.classList.add("show");
}


/* =====================================================
   FILE SIZE
===================================================== */

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }


    if (bytes < 1048576) {

        return (
            bytes / 1024
        ).toFixed(1) + " KB";

    }


    return (
        bytes / 1048576
    ).toFixed(1) + " MB";

}




function getFileIcon(type, name) {

    const lowerName =
        name.toLowerCase();


    if (
        type &&
        type.startsWith("image/")
    ) {

        return "fa-image";

    }


    if (
        type === "application/pdf"
    ) {

        return "fa-file-pdf";

    }


    if (
        type &&
        type.includes("word")
    ) {

        return "fa-file-word";

    }


    if (
        lowerName.endsWith(".doc") ||
        lowerName.endsWith(".docx")
    ) {

        return "fa-file-word";

    }


    if (
        type &&
        type.includes("excel")
    ) {

        return "fa-file-excel";

    }


    if (
        lowerName.endsWith(".xls") ||
        lowerName.endsWith(".xlsx")
    ) {

        return "fa-file-excel";

    }


    if (
        type &&
        type.includes("powerpoint")
    ) {

        return "fa-file-powerpoint";

    }


    if (
        lowerName.endsWith(".ppt") ||
        lowerName.endsWith(".pptx")
    ) {

        return "fa-file-powerpoint";

    }


    if (
        type &&
        type.startsWith("text/")
    ) {

        return "fa-file-lines";

    }


    if (
        lowerName.endsWith(".html") ||
        lowerName.endsWith(".css") ||
        lowerName.endsWith(".js")
    ) {

        return "fa-file-code";

    }


    return "fa-file";

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(text) {

    return text.replace(
        /[&<>"']/g,
        function (character) {

            const entities = {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            };


            return entities[
                character
            ];

        }
    );

}


/* =====================================================
   INITIALIZE FILE PAGE
===================================================== */

async function initializeFilePage() {

    const category =
        document.body.dataset.category;


    if (!category) {

        return;

    }


    const input =
        document.getElementById(
            "fileInput"
        );


    const grid =
        document.getElementById(
            "fileGrid"
        );


    const count =
        document.getElementById(
            "fileCount"
        );


    if (
        !input ||
        !grid ||
        !count
    ) {

        return;

    }


    /* =================================================
       RENDER FILES
    ================================================= */

    async function renderFiles() {

        grid.innerHTML = "";


        const files =
            await getFiles(
                category
            );


        count.textContent =
            `${files.length} file${
                files.length === 1
                    ? ""
                    : "s"
            } saved`;


        /* EMPTY */
        if (files.length === 0) {

            grid.innerHTML = `

                <div class="empty-state">

                    <i class="
                        fa-regular
                        fa-folder-open
                    "></i>

                    <h3>
                        No files yet
                    </h3>

                    <p>
                        Choose a file above
                        to add your
                        ${category}
                        activity.
                    </p>

                </div>

            `;

            return;

        }


        /* FILE CARDS */

        files.forEach(
            (file, index) => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "file-card";


                card.style.animationDelay =
                    `${index * 0.07}s`;


                card.innerHTML = `

                    <div class="file-icon">

                        <i class="
                            fa-solid
                            ${getFileIcon(
                                file.type,
                                file.name
                            )}
                        "></i>

                    </div>


                    <h3
                        title="${escapeHTML(
                            file.name
                        )}"
                    >

                        ${escapeHTML(
                            file.name
                        )}

                    </h3>


                    <p>

                        ${formatFileSize(
                            file.size
                        )}

                        ·

                        ${
                            file.type ||
                            "File"
                        }

                    </p>


                    <div class="file-actions">

                        <button
                            class="view-button"
                            type="button"
                        >

                            <i class="
                                fa-solid
                                fa-eye
                            "></i>

                            View

                        </button>


                        <button
                            class="delete-button"
                            type="button"
                        >

                            <i class="
                                fa-solid
                                fa-trash
                            "></i>

                            Delete

                        </button>

                    </div>

                `;


                /* VIEW */

                const viewButton =
                    card.querySelector(
                        ".view-button"
                    );


                viewButton.onclick =
                    function () {

                        openFileViewer(
                            file
                        );

                    };


                /* DELETE */

                const deleteButton =
                    card.querySelector(
                        ".delete-button"
                    );


                deleteButton.onclick =
                    async function () {

                        const confirmed =
                            confirm(
                                `Are you sure you want to delete "${file.name}"?`
                            );


                        if (!confirmed) {

                            return;

                        }


                        try {

                            await deleteFile(
                                file.id
                            );


                            await renderFiles();

                        }

                        catch (error) {

                            console.error(
                                error
                            );

                            alert(
                                "Unable to delete the file."
                            );

                        }

                    };


                grid.appendChild(
                    card
                );

            }
        );

    }
    function viewLabFile() {

    const modal = document.getElementById("fileModal");
    const title = document.getElementById("modalTitle");
    const content = document.getElementById("modalContent");

    title.textContent = "Laboratory 1 - RODIL_LAB1.pdf";

    content.innerHTML = `
        <iframe
            src="RODIL_LAB1.pdf"
            style="
                width: 100%;
                height: 75vh;
                border: none;
                border-radius: 10px;
            ">
        </iframe>
    `;

    modal.classList.add("show");
}

    /* =================================================
       FILE INPUT
    ================================================= */

    input.addEventListener(
        "change",
        async function () {

            const selectedFiles =
                Array.from(
                    input.files
                );


            if (
                selectedFiles.length === 0
            ) {

                return;

            }


            for (
                const file
                of selectedFiles
            ) {

                /*
                    Maximum file size:
                    25 MB
                */

                if (
                    file.size >
                    25 * 1024 * 1024
                ) {

                    alert(
                        `${file.name} is larger than 25 MB and was skipped.`
                    );

                    continue;

                }


                try {

                    await addFile(
                        file,
                        category
                    );

                }

                catch (error) {

                    console.error(
                        "Error saving file:",
                        error
                    );

                    alert(
                        `Unable to save ${file.name}.`
                    );

                }

            }


            input.value = "";


            await renderFiles();

        }
    );


    await renderFiles();

}


/* =====================================================
   FILE VIEWER
===================================================== */

function openFileViewer(file) {

    const modal =
        document.getElementById(
            "fileModal"
        );


    const title =
        document.getElementById(
            "modalTitle"
        );


    const content =
        document.getElementById(
            "modalContent"
        );


    const closeButton =
        document.getElementById(
            "closeModal"
        );


    if (
        !modal ||
        !title ||
        !content
    ) {

        return;

    }


    title.textContent =
        file.name;


    content.innerHTML = "";


    const fileURL =
        URL.createObjectURL(
            file.blob
        );


    /* =================================================
       IMAGE
    ================================================= */

    if (
        file.type &&
        file.type.startsWith("image/")
    ) {

        const image =
            document.createElement(
                "img"
            );


        image.src =
            fileURL;


        image.alt =
            file.name;


        content.appendChild(
            image
        );

    }


    /* =================================================
       PDF
    ================================================= */

    else if (
        file.type ===
        "application/pdf"
    ) {

        const iframe =
            document.createElement(
                "iframe"
            );


        iframe.src =
            fileURL;


        iframe.title =
            file.name;


        content.appendChild(
            iframe
        );

    }


    /* =================================================
       TEXT
    ================================================= */

    else if (
        file.type &&
        file.type.startsWith("text/")
    ) {

        const reader =
            new FileReader();


        reader.onload =
            function () {

                const pre =
                    document.createElement(
                        "pre"
                    );


                pre.textContent =
                    reader.result;


                content.appendChild(
                    pre
                );

            };


        reader.readAsText(
            file.blob
        );

    }


    /* =================================================
       HTML / CSS / JS
    ================================================= */

    else if (
        file.name.toLowerCase().endsWith(".html") ||
        file.name.toLowerCase().endsWith(".css") ||
        file.name.toLowerCase().endsWith(".js")
    ) {

        const reader =
            new FileReader();


        reader.onload =
            function () {

                const pre =
                    document.createElement(
                        "pre"
                    );


                pre.textContent =
                    reader.result;


                content.appendChild(
                    pre
                );

            };


        reader.readAsText(
            file.blob
        );

    }


    /* =================================================
       UNSUPPORTED
    ================================================= */

    else {

        content.innerHTML = `

            <div class="unsupported">

                <div>

                    <i class="
                        fa-solid
                        ${getFileIcon(
                            file.type,
                            file.name
                        )}
                    "></i>

                    <h3>
                        Preview is not available
                    </h3>

                    <p>

                        This file type cannot
                        be displayed directly
                        in the browser.

                        You can still keep it
                        in your portfolio.

                    </p>

                </div>

            </div>

        `;

    }


    modal.classList.add(
        "show"
    );


    /* =================================================
       CLOSE VIEWER
    ================================================= */

    function closeViewer() {

        modal.classList.remove(
            "show"
        );


        setTimeout(
            function () {

                content.innerHTML = "";

            },
            250
        );


        URL.revokeObjectURL(
            fileURL
        );

    }


    if (closeButton) {

        closeButton.onclick =
            closeViewer;

    }


    modal.onclick =
        function (event) {

            if (
                event.target ===
                modal
            ) {

                closeViewer();

            }

        };

}


/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        const modal =
            document.getElementById(
                "fileModal"
            );


        if (
            !modal ||
            !modal.classList.contains("show")
        ) {

            return;

        }


        modal.classList.remove(
            "show"
        );

    }
);


/* =====================================================
   TYPING EFFECT
===================================================== */

function typingEffect() {

    const element =
        document.querySelector(
            ".typing-text"
        );


    if (!element) {

        return;

    }


    const words = [
        "IT Student",
        "Future Developer",
        "Programmer",
        "Technology Enthusiast"
    ];


    let wordIndex = 0;

    let charIndex = 0;

    let deleting = false;


    function type() {

        const currentWord =
            words[wordIndex];


        if (!deleting) {

            element.textContent =
                currentWord.substring(
                    0,
                    charIndex + 1
                );

            charIndex++;


            if (
                charIndex ===
                currentWord.length
            ) {

                deleting = true;

                setTimeout(
                    type,
                    1600
                );

                return;

            }

        }

        else {

            element.textContent =
                currentWord.substring(
                    0,
                    charIndex - 1
                );

            charIndex--;


            if (
                charIndex === 0
            ) {

                deleting = false;

                wordIndex =
                    (wordIndex + 1)
                    % words.length;

            }

        }


        setTimeout(
            type,
            deleting
                ? 55
                : 90
        );

    }


    type();

}


/* =====================================================
   SCROLL REVEAL
===================================================== */

function initializeScrollReveal() {

    const elements =
        document.querySelectorAll(
            ".reveal-up, .reveal-left, .reveal-right"
        );


    if (
        elements.length === 0
    ) {

        return;

    }


    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(
                    function (entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: .12
            }
        );


    elements.forEach(
        function (element) {

            observer.observe(
                element
            );

        }
    );

}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeFilePage();

        typingEffect();

        initializeScrollReveal();

    }
);