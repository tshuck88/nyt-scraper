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
    })
})