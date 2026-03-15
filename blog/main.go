package main

import (
	"fmt"
	"os"
)

const Head string = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Beyond The Screen</title>
<link rel="stylesheet" href="style.css">
</head>

<body>
<header>
<nav class="navbar">
<div class="logo">Beyond The Screen</div>
<ul class="nav-links">
<li><a href="/">Home</a></li>
<li><a href="blog.html">Blog</a></li>
<li><a href="games.html">Games</a></li>
</ul>
</nav>
</header>

<div class="container">
`

const Foot string = `</div>
</body>
<footer>
© 2026 My Blog | All Rights Reserved
</footer>
</html>`

const Main string = ` <main class="main-content">

<div class="post-header" id="title">
%s
<div class="post-meta" id="date">
%s
</div>
</div>

<div class="post-body" id="body">
%s
</div>

<div class="post-footer" id="footer">
%s
</div>

</main>`

const BlogList string = `<ul class="blog-list" id="blog-list"> %s </ul>`

func writeHTML(content, fileName string) {
	saveDir := "../"
	// Head is the top part of the HTML and Foot is the bottom part of HTML
	html := Head + content + Foot
	err := os.WriteFile(saveDir+fileName, []byte(html), 0644)
	if err != nil {
		panic(err)
	}
}

func addPage(pg *[]PageData, filename string) {
	blogDir := "./xdfiles/"
	page := PageData{}
	page.ReadXDFileNative(blogDir + filename + ".xd")
	*pg = append(*pg, page)
}

func main() {
	// NOTE: Generate index HTML
	front := PageData{}
	front.ReadXDFileNative("./xdfiles/front.xd")

	title, date, body, footer := front.GenerateHTML()
	frontContent := fmt.Sprintf(Main, title, date, body, footer)

	writeHTML(frontContent, "index.html")

	//NOTE: Prepare Blog page
	var pages []PageData
	addPage(&pages, "page")

	for idx, pg := range pages {
		fileName := fmt.Sprintf("page%d.html", idx)
		title, date, body, footer := pg.GenerateHTML()
		content := fmt.Sprintf(Main, title, date, body, footer)
		writeHTML(content, fileName)
	}

	//NOTE: Create blogPage list
	var blogPageList string

	for idx, pg := range pages {
		pageId := idx
		var titleId int
		var dateId int
		for _, pageMap := range pg.pageMapArray {
			if v, ok := pageMap[TITLE]; ok {
				titleId = v[0]
			} else if v, ok := pageMap[DATE]; ok {
				dateId = v[0]
			}
		}

		link := fmt.Sprintf(`<a href="page%d.html">%s</a>`, pageId, pg.texts[titleId])
		blogTitle := fmt.Sprintf(`<div class="blog-title">%s</div>`, link)
		blogDate := fmt.Sprintf(`<div class="published-date">%s</div>`, pg.texts[dateId])
		blogItem := fmt.Sprintf(`<li class="blog-item">%s%s</li>`, blogTitle, blogDate)

		blogPageList += blogItem
	}

	blogContent := fmt.Sprintf(BlogList, blogPageList)
	writeHTML(blogContent, "blog.html")

	gamesPage := PageData{}
	gamesPage.ReadXDFileNative("./xdfiles/games.xd")

	t, d, b, f := gamesPage.GenerateHTML()
	gamesContent := fmt.Sprintf(Main, t, d, b, f)
	writeHTML(gamesContent, "games.html")

}
