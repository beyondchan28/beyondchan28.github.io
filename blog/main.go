package main

import (
	"fmt"
)

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
