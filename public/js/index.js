// Event handler to move articles to saved
$(document).on("click", ".save-article-button", function () {
    const article = $(this);
    const articleID = $(this).data("id");

    $.ajax({
        url: "/saved/" + articleID,
        type: "PUT"
    }).then(function (data) {
        $(article).parents(".card").remove();
    });
});

$(document).on("click", "#clear-articles", function () {
    $.get("/clear");
});

$(document).on("click", ".remove-article-button", function () {
    const article = $(this);
    const articleID = $(this).data("id");
    $.ajax({
        url: "/clear/" + articleID,
        type: "DELETE"
    }).then(function (data) {
        $(article).parents(".card").remove();
    });
});

$(document).on("click", "#add-note-button", function () {
    const text = $("#add-note-text").val();
    const articleID = $(this).data("id");
    if (text) {
        $.post("/article/" + articleID, { body: text })
            .then(function (data) {
                console.log(data)
                $("#add-note-text").val("");
                $('#staticBackdrop').modal('hide');
            });
    } else {
        alert("Please enter a note")
    }

});

$(document).on("click", "#article-notes", function () {
    const articleID = $(this).data("id");
    $.get("/article/" + articleID)
        .then(function (data) {
            $("#notes-container").empty();
            const notesToRender = [];
            const note = data[0].note
            for (let i = 0; i < note.length; i++) {
                const currentNote = $('<div class="note d-flex justify-content-between p-1">')
                    .attr("data-id", note[i]._id)
                    .append("<p>" + note[i].body)
                    .append($("<button class='btn btn-danger note-delete'>x</button>"));
                notesToRender.push(currentNote);
            }
            $("#notes-container").append(notesToRender);
        });
});

$(document).on("click", ".note-delete", function () {
    const note = $(this).parent();
    const noteID = $(this).parent().data("id");
    $(note).remove();
    
    $.ajax({
        url: "/note/" + noteID,
        type: "DELETE"
    }).then(function (data) {

    });
})