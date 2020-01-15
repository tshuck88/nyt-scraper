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