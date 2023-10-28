const container = document.getElementById("container");
const addNoteButton = document.getElementById("addNote");

addNoteButton.addEventListener("click", createStickyNote);

function createNote() {
    const note = document.createElement("div");
    note.classList.add("note");

    const titleBar = document.createElement("div");
    titleBar.classList.add("title-bar");
    const title = document.createElement("div");
    title.contentEditable = true;
    title.textContent = "Title";

    // Create a save button with a floppy disk icon and tooltip
    const saveButton = document.createElement("button");
    saveButton.innerHTML = '<i class="fas fa-cloud-arrow-up"/>';
    saveButton.classList.add("save-button");
    saveButton.title = "Save Note to Cloud"; // Tooltip text

    saveButton.addEventListener("click", () => {
        const noteData = {
            noteId: note.dataset.id, // Get the unique ID of the note
            title: note.querySelector(".title-bar div").textContent,
            content: note.querySelector(".content").innerHTML,
            top: note.style.top,
            left: note.style.left,
            width: note.style.width,
            height: note.style.height,
            backgroundColor: note.style.backgroundColor,
        };

        saveNoteToAPI(noteData); // Save the note to the API
    });

    // Create a delete button with a recycle bin icon
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.classList.add("delete-button");
    deleteButton.title = "Delete Note"; // Tooltip text

    deleteButton.addEventListener("click", () => {
        // Ask for confirmation before deleting the note
        const confirmed = confirm("Are you sure you want to delete this note?");
        if (confirmed) {
            removeNoteFromStorage(note.dataset.id);
            note.remove();
        }
    });

    // Add the title and delete button to the title bar
    titleBar.appendChild(title);
    titleBar.appendChild(deleteButton);
    titleBar.appendChild(saveButton);

    // Create a close button with a Font Awesome icon
    const closeButton = document.createElement("button");
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.classList.add("close-button");
    closeButton.title = "Hide Note"; // Tooltip text

    closeButton.addEventListener("click", () => {
        note.remove();
    });

    titleBar.appendChild(closeButton);

    const content = document.createElement("div");
    content.classList.add("content");
    content.contentEditable = true;
    content.textContent = "Click to edit...";
    // content.innerHTML = "";



    note.appendChild(titleBar);
    note.appendChild(content);

    return note;
}

// Function to remove a note from storage
function removeNoteFromStorage(noteId) {
    localStorage.removeItem(noteId);
}


function addEventListeners(note) {

    // Make the note draggable and resizable
    makeStickyNoteDraggable(note);
    makeStickyNoteResizable(note);

    const title = note.querySelector(".title-bar div");
    const content = note.querySelector(".content");

    if (title) {
        title.addEventListener("input", saveNote(note));
    }
    if (content) {
        content.addEventListener("input", saveNote(note));
    }

    note.addEventListener("mousedown", () => {
        note.addEventListener("mousemove", saveNoteOnMoveResize(note));
    });

    note.addEventListener("mouseup", () => {
        note.removeEventListener("mousemove", saveNoteOnMoveResize(note));
    });
}

function setRandomNoteBackgroundColor(note) {
    const randomColor = getRandomColor();
    note.style.backgroundColor = randomColor;
}

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360); // Random hue value
    const lightness = Math.floor(Math.random() * 40) + 60; // Lightness between 60% and 100%
    return `hsl(${hue}, 100%, ${lightness}%)`;
}


function createStickyNote() {
    const note = createNote();

    const noteId = generateUniqueId(); // Generate a unique ID for the note
    note.dataset.id = noteId; // Store the ID as a data attribute

    // Set an initial position for the note
    note.style.top = '30px';
    note.style.left = '10px';

    container.appendChild(note);

    addEventListeners(note);

    // Add a random background color
    setRandomNoteBackgroundColor(note);

    // Save the note immediately after creating it
    saveNote(note);


}

function generateUniqueId() {
    return 'note-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveNote(note) {
    const noteId = note.dataset.id; // Get the unique ID of the note

    const savedNote = {
        title: note.querySelector(".title-bar div").textContent,
        content: note.querySelector(".content").innerHTML,
        top: note.style.top,
        left: note.style.left,
        width: note.style.width,
        height: note.style.height,
        backgroundColor: note.style.backgroundColor,
    };

    localStorage.setItem(noteId, JSON.stringify(savedNote)); // Use the ID as the key
}



// Function to save notes when edited, moved, or resized
function saveNoteOnMoveResize(note) {
    saveNote(note);
}

function makeStickyNoteDraggable(note) {
    let isDragging = false;
    let initialX;
    let initialY;

    note.addEventListener("mousedown", (e) => {
        if (e.target !== note) return; // Ignore mousedown events on children
        isDragging = true;
        initialX = e.clientX - note.getBoundingClientRect().left;
        initialY = e.clientY - note.getBoundingClientRect().top;
    });

        // Touch event listeners for mobile devices
        note.addEventListener("touchstart", (e) => {
            if (e.target !== note) return; // Ignore touchstart events on children
            isDragging = true;
            const boundingBox = note.getBoundingClientRect();
            offsetX = e.touches[0].clientX - boundingBox.left;
            offsetY = e.touches[0].clientY - boundingBox.top;
            e.preventDefault(); // Prevent the default touch behavior
        });
    
    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const x = e.clientX - initialX;
            const y = e.clientY - initialY;
            note.style.left = x + "px";
            note.style.top = y + "px";
        }
    });

    // Touch event listener for mobile devices
    document.addEventListener("touchmove", (e) => {
        if (isDragging) {
            const x = e.touches[0].clientX - offsetX;
            const y = e.touches[0].clientY - offsetY;
            note.style.left = x + "px";
            note.style.top = y + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    // Touch event listener for mobile devices
    document.addEventListener("touchend", () => {
        isDragging = false;
    });

    note.addEventListener("dragstart", (e) => e.preventDefault());
}

function makeStickyNoteResizable(note) {
    const resizeHandle = document.createElement("div");
    resizeHandle.classList.add("resize-handle");

    note.appendChild(resizeHandle);

    let isResizing = false;
    let initialWidth;
    let initialHeight;

    resizeHandle.addEventListener("mousedown", (e) => {
        if (e.target !== note) {
            isDragging = false;
        }

        isResizing = true;
        initialWidth = note.offsetWidth;
        initialHeight = note.offsetHeight;
        e.preventDefault();
        e.stopPropagation(); // Stop propagation to avoid conflicts
    });

    document.addEventListener("mousemove", (e) => {
        if (isResizing) {
            const newWidth = initialWidth + e.clientX - (note.getBoundingClientRect().left + initialWidth);
            const newHeight = initialHeight + e.clientY - (note.getBoundingClientRect().top + initialHeight);
            note.style.width = newWidth + "px";
            note.style.height = newHeight + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        isResizing = false;
    });

}

function restoreNotes() {
    for (let i = 0; i < localStorage.length; i++) {
        const noteId = localStorage.key(i);

        if (noteId.startsWith("note-")) {
            const savedNote = JSON.parse(localStorage.getItem(noteId));
            const note = createNote();
            note.querySelector(".title-bar div").textContent = savedNote.title;
            note.querySelector(".content").innerHTML = savedNote.content;
            note.style.top = savedNote.top;
            note.style.left = savedNote.left;
            note.style.width = savedNote.width;
            note.style.height = savedNote.height;
            note.style.backgroundColor = savedNote.backgroundColor;
            note.dataset.id = noteId; // Set the note's ID from local storage

            addEventListeners(note);

            container.appendChild(note);
        }
    }
}

function saveNoteToAPI(noteData) {
    const apiUrl = "https://your-api-endpoint.com/notes"; // Replace with your actual API endpoint

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save the note to the API');
            }
            return response.json();
        })
        .then(data => {
            console.log('Note saved to the API:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Call the function to restore notes when the page loads
restoreNotes();
