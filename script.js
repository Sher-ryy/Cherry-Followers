let notFollowingBack = [];
let filteredUsers = [];

let currentIndex = 0;
let currentView = "card";


// ==========================================
// ELEMENTOS
// ==========================================

const file1 = document.getElementById("file1");
const file2 = document.getElementById("file2");

const selectFile1 = document.getElementById("selectFile1");
const selectFile2 = document.getElementById("selectFile2");

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

    selectFile1.addEventListener("click", () => {
        file1.click();
    });

}


if (selectFile2 && file2) {

    selectFile2.addEventListener("click", () => {
        file2.click();
    });

}


if (file1) {

    file1.addEventListener("change", () => {

        const fileName =
            document.getElementById("fileName1");

        if (fileName && file1.files.length) {

            fileName.textContent =
                file1.files[0].name;

        }

    });

}


if (file2) {

    file2.addEventListener("change", () => {

        const fileName =
            document.getElementById("fileName2");

        if (fileName && file2.files.length) {

            fileName.textContent =
                file2.files[0].name;

        }

    });

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
        file1.files[0];

    const followersFile =
        file2.files[0];


    if (!followingFile || !followersFile) {

        alert(
            "Selecciona ambos archivos."
        );

        return;

    }


    const reader1 = new FileReader();
    const reader2 = new FileReader();


    reader1.onload = e => {

        const followingJson =
            JSON.parse(e.target.result);


        reader2.onload = e2 => {

            const followersJson =
                JSON.parse(e2.target.result);


            const following =
                extractFollowing(followingJson);


            const followers =
                extractFollowers(followersJson);


            const followersSet =
                new Set(
                    followers.map(
                        u =>
                        normalizeUsername(
                            u.username
                        )
                    )
                );


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
                [...notFollowingBack];


            currentIndex = 0;


            updateStats(
                following.length,
                followers.length,
                notFollowingBack.length
            );


            document.getElementById(
                "results"
            ).style.display = "block";


            render();


        };


        reader2.readAsText(
            followersFile
        );

    };


    reader1.readAsText(
        followingFile
    );

}
// ==========================================
// EXTRAER USUARIOS
// ==========================================


function extractFollowing(json) {

    const users = [];


    if (
        json.relationships_following &&
        Array.isArray(json.relationships_following)
    ) {

        json.relationships_following.forEach(
            item => {

                if (!item.title) return;


                users.push({

                    username: item.title,

                    href:
                        item.string_list_data?.[0]?.href || ""

                });

            }
        );

    }


    return users;

}



function extractFollowers(json) {

    const users = [];


    if (Array.isArray(json)) {

        json.forEach(item => {

            if (!item.string_list_data)
                return;


            item.string_list_data.forEach(sub => {

                if (!sub.value)
                    return;


                users.push({

                    username: sub.value,

                    href: sub.href || ""

                });

            });

        });

    }


    return users;

}




// ==========================================
// NORMALIZAR USERNAME
// ==========================================


function normalizeUsername(username) {

    return username
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


    if (followingCount)
        followingCount.textContent = following;


    if (followersCount)
        followersCount.textContent = followers;


    if (notFollowingCount)
        notFollowingCount.textContent = notFollowing;


    if (description) {

        description.textContent =
            notFollowing === 1

            ? "1 persona no te sigue de vuelta."

            : `${notFollowing} personas no te siguen de vuelta.`;

    }

}




// ==========================================
// AVATAR
// ==========================================


function getInitials(username) {


    const clean =
        username
        .replace(/^@/, "")
        .trim();


    if (!clean)
        return "?";


    return clean
        .slice(0,2)
        .toUpperCase();

}



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


    avatar.textContent =
        getInitials(username);


    return avatar;

}




// ==========================================
// RENDER GENERAL
// ==========================================


function render() {


    renderCard();

    renderGrid();

    renderList();

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


    if (!container)
        return;


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
        currentIndex >= filteredUsers.length
    ) {

        currentIndex =
            filteredUsers.length - 1;

    }


    const user =
        filteredUsers[currentIndex];


    const card =
        document.createElement("div");


    card.className =
        "profile-card";


    card.appendChild(
        createAvatar(
            user.username,
            true
        )
    );


    const username =
        document.createElement("div");


    username.className =
        "username";


    username.textContent =
        "@" + user.username;


    card.appendChild(username);



    const status =
        document.createElement("div");


    status.className =
        "status";


    status.textContent =
        "● No te sigue de vuelta";


    card.appendChild(status);



    const counter =
        document.createElement("div");


    counter.className =
        "counter";


    counter.textContent =
        `${currentIndex + 1} de ${filteredUsers.length}`;


    card.appendChild(counter);



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


    if (!container)
        return;


    container.innerHTML = "";


    filteredUsers.forEach(user => {


        const card =
            document.createElement("div");


        card.className =
            "user-card";



        const avatar =
            createAvatar(
                user.username
            );


        card.appendChild(avatar);



        const name =
            document.createElement("strong");


        name.textContent =
            "@" + user.username;


        card.appendChild(name);



        const status =
            document.createElement("span");


        status.textContent =
            "No te sigue";


        card.appendChild(status);



        container.appendChild(card);


    });


}




// ==========================================
// VISTA LISTA
// ==========================================


function renderList() {

    const container =
        document.getElementById(
            "listContainer"
        );


    if (!container)
        return;


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


    filteredUsers.forEach((user, index) => {

        const item =
            document.createElement("div");


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
            document.createElement("div");


        info.className =
            "list-item-info";


        const username =
            document.createElement("strong");


        username.textContent =
            "@" + user.username;


        const status =
            document.createElement("span");


        status.textContent =
            "No te sigue de vuelta";


        info.appendChild(username);
        info.appendChild(status);


        item.appendChild(info);


        // ==================================
        // BOTÓN "VER PERFIL"
        // ==================================

        const viewProfileButton =
            document.createElement("button");


        viewProfileButton.className =
            "list-profile-button";


        viewProfileButton.type =
            "button";


        viewProfileButton.textContent =
            "Ver perfil →";


        viewProfileButton.addEventListener(
            "click",
            () => {

                // Seleccionar exactamente
                // este usuario
                currentIndex = index;


                // Cambiar a vista tarjeta
                changeView("card");


                // Renderizar el usuario seleccionado
                renderCard();


                // Llevar la pantalla
                // hasta la tarjeta
                document
                    .getElementById(
                        "cardContainer"
                    )
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

            }
        );


        item.appendChild(
            viewProfileButton
        );


        // ==================================
        // LINK A INSTAGRAM
        // ==================================

        if (user.href) {

            const link =
                document.createElement("a");


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
                "Abrir perfil de Instagram";


            item.appendChild(link);

        }


        container.appendChild(item);

    });

}


// ==========================================
// CAMBIAR VISTA
// ==========================================


document
.querySelectorAll(".view-button")
.forEach(button => {


    button.addEventListener(
        "click",
        () => {

            changeView(
                button.dataset.view
            );

        }
    );


});



function changeView(view) {


    currentView =
        view;



    document
    .querySelectorAll(".view-button")
    .forEach(button => {

        button.classList.remove(
            "active"
        );

    });



    const active =
        document.querySelector(
            `[data-view="${view}"]`
        );


    if (active)
        active.classList.add("active");



    updateViewVisibility();

}



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


    if (card)
        card.style.display =
            currentView === "card"
            ? "flex"
            : "none";


    if (grid)
        grid.style.display =
            currentView === "grid"
            ? "grid"
            : "none";


    if (list)
        list.style.display =
            currentView === "list"
            ? "flex"
            : "none";

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


    if (!filteredUsers.length)
        return;


    currentIndex--;


    if (currentIndex < 0) {

        currentIndex =
            filteredUsers.length - 1;

    }


    renderCard();

}



function nextUser() {


    if (!filteredUsers.length)
        return;


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
            user.username
            .toLowerCase()
            .includes(query)
        );



    currentIndex = 0;


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



        if (
            event.key === "ArrowLeft"
        ) {

            previousUser();

        }



        if (
            event.key === "ArrowRight"
        ) {

            nextUser();

        }


    }
);
