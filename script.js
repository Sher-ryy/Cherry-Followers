// ==========================================
// FOLLOW CHECKER
// SCRIPT COMPLETO
// ==========================================


// ==========================================
// VARIABLES GLOBALES
// ==========================================

let notFollowingBack = [];
let filteredUsers = [];

let currentIndex = 0;
let currentView = "card";


// ==========================================
// PAGINACIÓN
// ==========================================

const USERS_PER_PAGE = 50;

let currentPage = 1;


// ==========================================
// ELEMENTOS
// ==========================================

const file1 =
    document.getElementById("file1");

const file2 =
    document.getElementById("file2");

const selectFile1 =
    document.getElementById("selectFile1");

const selectFile2 =
    document.getElementById("selectFile2");

const compareButton =
    document.getElementById("compareButton");

const searchInput =
    document.getElementById("searchInput");

const themeButton =
    document.getElementById("themeButton");


// ==========================================
// SELECCIONAR ARCHIVOS
// ==========================================

if (selectFile1 && file1) {

    selectFile1.addEventListener(
        "click",
        () => {
            file1.click();
        }
    );

}


if (selectFile2 && file2) {

    selectFile2.addEventListener(
        "click",
        () => {
            file2.click();
        }
    );

}


// ==========================================
// NOMBRE DEL ARCHIVO 1
// ==========================================

if (file1) {

    file1.addEventListener(
        "change",
        () => {

            const fileName =
                document.getElementById(
                    "fileName1"
                );


            if (
                fileName &&
                file1.files.length > 0
            ) {

                fileName.textContent =
                    file1.files[0].name;

            } else if (fileName) {

                fileName.textContent =
                    "Ningún archivo seleccionado";

            }

        }
    );

}


// ==========================================
// NOMBRE DEL ARCHIVO 2
// ==========================================

if (file2) {

    file2.addEventListener(
        "change",
        () => {

            const fileName =
                document.getElementById(
                    "fileName2"
                );


            if (
                fileName &&
                file2.files.length > 0
            ) {

                fileName.textContent =
                    file2.files[0].name;

            } else if (fileName) {

                fileName.textContent =
                    "Ningún archivo seleccionado";

            }

        }
    );

}


// ==========================================
// COMPARAR ARCHIVOS
// ==========================================

if (compareButton) {

    compareButton.addEventListener(
        "click",
        compareJsonFiles
    );

}


function compareJsonFiles() {

    const followingFile =
        file1?.files?.[0];

    const followersFile =
        file2?.files?.[0];


    if (
        !followingFile ||
        !followersFile
    ) {

        alert(
            "Por favor, selecciona ambos archivos."
        );

        return;

    }


    const readerFollowing =
        new FileReader();

    const readerFollowers =
        new FileReader();


    // ======================================
    // FOLLOWING
    // ======================================

    readerFollowing.onload =
        function (event) {

            let followingJson;


            try {

                followingJson =
                    JSON.parse(
                        event.target.result
                    );

            } catch (error) {

                alert(
                    "El archivo de seguidos no es un JSON válido."
                );

                return;

            }


            // ==================================
            // FOLLOWERS
            // ==================================

            readerFollowers.onload =
                function (event) {

                    let followersJson;


                    try {

                        followersJson =
                            JSON.parse(
                                event.target.result
                            );

                    } catch (error) {

                        alert(
                            "El archivo de seguidores no es un JSON válido."
                        );

                        return;

                    }


                    const following =
                        extractFollowing(
                            followingJson
                        );


                    const followers =
                        extractFollowers(
                            followersJson
                        );


                    if (
                        !following.length ||
                        !followers.length
                    ) {

                        alert(
                            "No se encontraron datos válidos en uno o ambos archivos."
                        );

                        return;

                    }


                    // ==============================
                    // FOLLOWERS SET
                    // ==============================

                    const followersSet =
                        new Set(
                            followers.map(
                                user =>
                                    normalizeUsername(
                                        user.username
                                    )
                            )
                        );


                    // ==============================
                    // NO TE SIGUEN
                    // ==============================

                    notFollowingBack =
                        following.filter(
                            user =>
                                !followersSet.has(
                                    normalizeUsername(
                                        user.username
                                    )
                                )
                        );


                    filteredUsers =
                        [
                            ...notFollowingBack
                        ];


                    currentIndex = 0;

                    currentPage = 1;


                    // ==============================
                    // ESTADÍSTICAS
                    // ==============================

                    updateStats(
                        following.length,
                        followers.length,
                        notFollowingBack.length
                    );


                    // ==============================
                    // MOSTRAR RESULTADOS
                    // ==============================

                    const results =
                        document.getElementById(
                            "results"
                        );


                    if (results) {

                        results.style.display =
                            "block";

                    }


                    render();


                    if (results) {

                        results.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                };


            readerFollowers.readAsText(
                followersFile
            );

        };


    readerFollowing.readAsText(
        followingFile
    );

}


// ==========================================
// EXTRAER FOLLOWING
// ==========================================

function extractFollowing(json) {

    const users = [];


    if (
        json &&
        json.relationships_following &&
        Array.isArray(
            json.relationships_following
        )
    ) {

        json.relationships_following.forEach(
            item => {

                if (!item.title) {
                    return;
                }


                const href =
                    item
                        .string_list_data
                        ?. [0]
                        ?. href || "";


                users.push({

                    username:
                        item.title,

                    href:
                        href

                });

            }
        );

    }


    return users;

}


// ==========================================
// EXTRAER FOLLOWERS
// ==========================================

function extractFollowers(json) {

    const users = [];


    if (Array.isArray(json)) {

        json.forEach(item => {

            if (
                !item.string_list_data ||
                !Array.isArray(
                    item.string_list_data
                )
            ) {

                return;

            }


            item.string_list_data.forEach(
                sub => {

                    if (!sub.value) {
                        return;
                    }


                    users.push({

                        username:
                            sub.value,

                        href:
                            sub.href || ""

                    });

                }
            );

        });

    }


    return users;

}


// ==========================================
// NORMALIZAR USERNAME
// ==========================================

function normalizeUsername(
    username
) {

    return String(username)
        .trim()
        .toLowerCase()
        .replace(/^@/, "");

}


// ==========================================
// ESTADÍSTICAS
// ==========================================

function updateStats(
    following,
    followers,
    notFollowing
) {

    const followingCount =
        document.getElementById(
            "followingCount"
        );

    const followersCount =
        document.getElementById(
            "followersCount"
        );

    const notFollowingCount =
        document.getElementById(
            "notFollowingCount"
        );

    const description =
        document.getElementById(
            "resultDescription"
        );


    if (followingCount) {

        followingCount.textContent =
            following;

    }


    if (followersCount) {

        followersCount.textContent =
            followers;

    }


    if (notFollowingCount) {

        notFollowingCount.textContent =
            notFollowing;

    }


    if (description) {

        description.textContent =
            notFollowing === 1

            ? "1 persona no te sigue de vuelta."

            : `${notFollowing} personas no te siguen de vuelta.`;

    }

}


// ==========================================
// INICIALES
// ==========================================

function getInitials(username) {

    const clean =
        String(username)
            .replace(/^@/, "")
            .trim();


    if (!clean) {
        return "?";
    }


    const parts =
        clean
            .split(/[._-]/)
            .filter(Boolean);


    if (parts.length >= 2) {

        return (
            parts[0][0] +
            parts[1][0]
        ).toUpperCase();

    }


    return clean
        .slice(0, 2)
        .toUpperCase();

}


// ==========================================
// CREAR AVATAR
// ==========================================

function createAvatar(
    username,
    large = false
) {

    const avatar =
        document.createElement("div");


    avatar.className =
        large
            ? "avatar-large"
            : "avatar";


    // Iniciales primero como fallback
    avatar.textContent =
        getInitials(username);


    // ==============================
    // FOTO DE PERFIL
    // ==============================

    const img =
        document.createElement("img");


    img.src =
        `https://unavatar.io/instagram/${encodeURIComponent(username)}`;


    img.alt =
        `Foto de perfil de ${username}`;


    img.loading =
        "lazy";


    img.onload =
        function () {

            avatar.textContent = "";

            avatar.appendChild(img);

        };


    img.onerror =
        function () {

            // Se mantienen las iniciales
            avatar.textContent =
                getInitials(username);

        };


    return avatar;

}


// ==========================================
// RENDER GENERAL
// ==========================================

function render() {

    renderCard();

    renderGrid();

    renderList();

    renderPagination();

    updateViewVisibility();

}


// ==========================================
// VISTA TARJETA
// ==========================================

function renderCard() {

    const container =
        document.getElementById(
            "profileCard"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!filteredUsers.length) {

        container.innerHTML = `
            <div class="empty">
                <strong>
                    No encontramos usuarios
                </strong>

                Prueba con otra búsqueda.
            </div>
        `;

        return;

    }


    if (
        currentIndex >=
        filteredUsers.length
    ) {

        currentIndex =
            filteredUsers.length - 1;

    }


    if (currentIndex < 0) {

        currentIndex = 0;

    }


    const user =
        filteredUsers[currentIndex];


    const card =
        document.createElement("div");


    card.className =
        "profile-card";


    // ==============================
    // AVATAR
    // ==============================

    card.appendChild(
        createAvatar(
            user.username,
            true
        )
    );


    // ==============================
    // USERNAME
    // ==============================

    const username =
        document.createElement("div");


    username.className =
        "username";


    username.textContent =
        "@" + user.username;


    card.appendChild(username);


    // ==============================
    // STATUS
    // ==============================

    const status =
        document.createElement("div");


    status.className =
        "status";


    status.textContent =
        "● No te sigue de vuelta";


    card.appendChild(status);


    // ==============================
    // CONTADOR
    // ==============================

    const counter =
        document.createElement("div");


    counter.className =
        "counter";


    counter.textContent =
        `${currentIndex + 1} de ${filteredUsers.length}`;


    card.appendChild(counter);


    // ==============================
    // LINK INSTAGRAM
    // ==============================

    if (user.href) {

        const link =
            document.createElement("a");


        link.className =
            "profile-link";


        link.href =
            user.href;


        link.target =
            "_blank";


        link.rel =
            "noopener noreferrer";


        link.textContent =
            "Ver perfil ↗";


        card.appendChild(link);

    }


    container.appendChild(card);

}


// ==========================================
// VISTA GRID
// ==========================================

function renderGrid() {

    const container =
        document.getElementById(
            "gridContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!filteredUsers.length) {

        container.innerHTML = `
            <div class="empty">
                <strong>
                    No encontramos usuarios
                </strong>

                Prueba con otra búsqueda.
            </div>
        `;

        return;

    }


    filteredUsers.forEach(
        user => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "user-card";


            // ==========================
            // TOP
            // ==========================

            const top =
                document.createElement(
                    "div"
                );


            top.className =
                "user-card-top";


            top.appendChild(
                createAvatar(
                    user.username
                )
            );


            // ==========================
            // INFO
            // ==========================

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "user-info";


            const username =
                document.createElement(
                    "strong"
                );


            username.textContent =
                "@" + user.username;


            const status =
                document.createElement(
                    "span"
                );


            status.textContent =
                "No te sigue";


            info.appendChild(
                username
            );

            info.appendChild(
                status
            );


            top.appendChild(
                info
            );


            card.appendChild(
                top
            );


            // ==========================
            // INSTAGRAM
            // ==========================

            if (user.href) {

                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    user.href;


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                link.textContent =
                    "Ver perfil ↗";


                card.appendChild(
                    link
                );

            }


            container.appendChild(
                card
            );

        }
    );

}


// ==========================================
// VISTA LISTA
// ==========================================

function renderList() {

    const container =
        document.getElementById(
            "listContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!filteredUsers.length) {

        container.innerHTML = `
            <div class="empty">
                <strong>
                    No encontramos usuarios
                </strong>

                Prueba con otra búsqueda.
            </div>
        `;

        return;

    }


    // ======================================
    // CALCULAR USUARIOS DE ESTA PÁGINA
    // ======================================

    const start =
        (currentPage - 1) *
        USERS_PER_PAGE;


    const end =
        start +
        USERS_PER_PAGE;


    const pageUsers =
        filteredUsers.slice(
            start,
            end
        );


    pageUsers.forEach(
        (user, pageIndex) => {

            // Índice REAL dentro de filteredUsers
            const realIndex =
                start + pageIndex;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "list-item";


            // ==================================
            // AVATAR
            // ==================================

            item.appendChild(
                createAvatar(
                    user.username
                )
            );


            // ==================================
            // INFORMACIÓN
            // ==================================

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "list-item-info";


            const username =
                document.createElement(
                    "strong"
                );


            username.textContent =
                "@" + user.username;


            const status =
                document.createElement(
                    "span"
                );


            status.textContent =
                "No te sigue de vuelta";


            info.appendChild(
                username
            );


            info.appendChild(
                status
            );


            item.appendChild(
                info
            );


            // ==================================
            // BOTÓN VER PERFIL
            // ==================================

            const viewButton =
                document.createElement(
                    "button"
                );


            viewButton.type =
                "button";


            viewButton.className =
                "list-profile-button";


            viewButton.textContent =
                "Ver perfil →";


            viewButton.title =
                "Abrir este usuario en vista de perfil";


            viewButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    // Seleccionar usuario REAL
                    currentIndex =
                        realIndex;


                    // Cambiar a tarjeta
                    changeView(
                        "card"
                    );


                    // Mostrar exactamente
                    // este usuario
                    renderCard();


                    // Llevar pantalla
                    // hasta la tarjeta
                    document
                        .getElementById(
                            "cardContainer"
                        )
                        ?.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "center"
                        });

                }
            );


            item.appendChild(
                viewButton
            );


            // ==================================
            // LINK INSTAGRAM
            // ==================================

            if (user.href) {

                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    user.href;


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                link.className =
                    "list-instagram-link";


                link.textContent =
                    "↗";


                link.title =
                    "Abrir Instagram";


                link.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                    }
                );


                item.appendChild(
                    link
                );

            }


            container.appendChild(
                item
            );

        }
    );

}


// ==========================================
// PAGINACIÓN
// ==========================================

function renderPagination() {

    const container =
        document.getElementById(
            "listContainer"
        );


    if (!container) {
        return;
    }


    // Eliminar paginación anterior
    const oldPagination =
        document.getElementById(
            "pagination"
        );


    if (oldPagination) {

        oldPagination.remove();

    }


    const totalPages =
        Math.ceil(
            filteredUsers.length /
            USERS_PER_PAGE
        );


    // Si solo hay una página,
    // no mostramos controles
    if (totalPages <= 1) {

        return;

    }


    const pagination =
        document.createElement(
            "div"
        );


    pagination.id =
        "pagination";


    pagination.className =
        "pagination";


    // ==================================
    // BOTÓN ANTERIOR
    // ==================================

    const previous =
        document.createElement(
            "button"
        );


    previous.type =
        "button";


    previous.className =
        "pagination-button";


    previous.textContent =
        "←";


    previous.disabled =
        currentPage === 1;


    previous.addEventListener(
        "click",
        () => {

            if (
                currentPage <= 1
            ) {
                return;
            }


            currentPage--;


            render();


            document
                .getElementById(
                    "listContainer"
                )
                ?.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });

        }
    );


    pagination.appendChild(
        previous
    );


    // ==================================
    // NÚMEROS DE PÁGINA
    // ==================================

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "pagination-button";


        button.textContent =
            page;


        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.addEventListener(
            "click",
            () => {

                currentPage =
                    page;


                render();


                document
                    .getElementById(
                        "listContainer"
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",

                        block:
                            "start"
                    });

            }
        );


        pagination.appendChild(
            button
        );

    }


    // ==================================
    // BOTÓN SIGUIENTE
    // ==================================

    const next =
        document.createElement(
            "button"
        );


    next.type =
        "button";


    next.className =
        "pagination-button";


    next.textContent =
        "→";


    next.disabled =
        currentPage === totalPages;


    next.addEventListener(
        "click",
        () => {

            if (
                currentPage >=
                totalPages
            ) {

                return;

            }


            currentPage++;


            render();


            document
                .getElementById(
                    "listContainer"
                )
                ?.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });

        }
    );


    pagination.appendChild(
        next
    );


    // ==================================
    // INSERTAR DESPUÉS DE LA LISTA
    // ==================================

    container.parentNode.insertBefore(
        pagination,
        container.nextSibling
    );

}


// ==========================================
// CAMBIAR VISTA
// ==========================================

document
    .querySelectorAll(
        ".view-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    changeView(
                        button.dataset.view
                    );

                }
            );

        }
    );


function changeView(view) {

    currentView =
        view;


    document
        .querySelectorAll(
            ".view-button"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    const activeButton =
        document.querySelector(
            `[data-view="${view}"]`
        );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }


    updateViewVisibility();

}


// ==========================================
// VISIBILIDAD DE VISTAS
// ==========================================

function updateViewVisibility() {

    const card =
        document.getElementById(
            "cardContainer"
        );

    const grid =
        document.getElementById(
            "gridContainer"
        );

    const list =
        document.getElementById(
            "listContainer"
        );


    if (card) {

        card.style.display =
            currentView === "card"
                ? "flex"
                : "none";

    }


    if (grid) {

        grid.style.display =
            currentView === "grid"
                ? "grid"
                : "none";

    }


    if (list) {

        list.style.display =
            currentView === "list"
                ? "flex"
                : "none";

    }

}


// ==========================================
// NAVEGACIÓN TARJETA
// ==========================================

const previousButton =
    document.getElementById(
        "previousButton"
    );

const nextButton =
    document.getElementById(
        "nextButton"
    );


if (previousButton) {

    previousButton.addEventListener(
        "click",
        previousUser
    );

}


if (nextButton) {

    nextButton.addEventListener(
        "click",
        nextUser
    );

}


function previousUser() {

    if (!filteredUsers.length) {
        return;
    }


    currentIndex--;


    if (currentIndex < 0) {

        currentIndex =
            filteredUsers.length - 1;

    }


    renderCard();

}


function nextUser() {

    if (!filteredUsers.length) {
        return;
    }


    currentIndex++;


    if (
        currentIndex >=
        filteredUsers.length
    ) {

        currentIndex = 0;

    }


    renderCard();

}


// ==========================================
// BUSCADOR
// ==========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchUsers
    );

}


function searchUsers() {

    const query =
        searchInput
            .value
            .trim()
            .toLowerCase()
            .replace(/^@/, "");


    filteredUsers =
        notFollowingBack.filter(
            user =>
                normalizeUsername(
                    user.username
                ).includes(
                    query
                )
        );


    currentIndex = 0;

    currentPage = 1;


    render();

}


// ==========================================
// MODO OSCURO
// ==========================================

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    if (themeButton) {

        themeButton.textContent =
            isDark
                ? "☀"
                : "☾";

    }


    localStorage.setItem(
        "followCheckerTheme",
        isDark
            ? "dark"
            : "light"
    );

}


if (themeButton) {

    themeButton.addEventListener(
        "click",
        toggleTheme
    );

}


// ==========================================
// CARGAR TEMA GUARDADO
// ==========================================

const savedTheme =
    localStorage.getItem(
        "followCheckerTheme"
    );


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark"
    );


    if (themeButton) {

        themeButton.textContent =
            "☀";

    }

}


// ==========================================
// FLECHAS DEL TECLADO
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            currentView !== "card" ||
            !filteredUsers.length
        ) {

            return;

        }


        // No cambiar de usuario mientras
        // se está escribiendo en el buscador
        if (
            document.activeElement ===
            searchInput
        ) {

            return;

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            previousUser();

        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            nextUser();

        }

    }
);
