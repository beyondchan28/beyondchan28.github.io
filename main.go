package main

import (
	"fmt"
	"github.com/beyondchan28/beyondchan28.github.io/blog"
	"github.com/beyondchan28/beyondchan28.github.io/xdparser"
	"strings"
)

func addPage(pg *[]xdparser.PageData, filename string) {
	blogDir := "./static/xdfiles/"
	page := xdparser.PageData{}
	page.ReadXDFileNative(blogDir + filename + ".xd")
	*pg = append(*pg, page)
}

func main() {
	// NOTE: Generate index HTML
	front := xdparser.PageData{}
	front.ReadXDFileNative("./static/xdfiles/front.xd")

	title, date, body, footer := front.GenerateHTML()
	frontContent := fmt.Sprintf(blog.Main, title, date, body, footer)

	blog.WriteHTML(frontContent, "./index.html")

	//NOTE: Prepare Blog page
	var pages []xdparser.PageData
	addPage(&pages, "page")
	addPage(&pages, "page2")
	addPage(&pages, "page3")
	addPage(&pages, "page4")
	addPage(&pages, "page5")

	for idx, pg := range pages {
		fileName := fmt.Sprintf("./templates/page%d.html", idx)
		title, date, body, footer := pg.GenerateHTML()
		content := fmt.Sprintf(blog.Main, title, date, body, footer)
		blog.WriteHTML(content, fileName)
	}

	//NOTE: Create blogPage list
	var blogPageList strings.Builder

	for idx, pg := range pages {
		pageId := idx
		var titleId int
		var dateId int
		for _, pageMap := range pg.PageMapArray {
			if v, ok := pageMap[xdparser.TITLE]; ok {
				titleId = v[0]
			} else if v, ok := pageMap[xdparser.DATE]; ok {
				dateId = v[0]
			}
		}

		link := fmt.Sprintf(`<a href="./page%d.html">%s</a>`, pageId, pg.Texts[titleId])
		blogTitle := fmt.Sprintf(`<div class="blog-title">%s</div>`, link)
		blogDate := fmt.Sprintf(`<div class="published-date">%s</div>`, pg.Texts[dateId])
		blogItem := fmt.Sprintf(`<li class="blog-item">%s%s</li>`, blogTitle, blogDate)

		blogPageList.WriteString(blogItem)
	}

	blogContent := fmt.Sprintf(blog.BlogList, blogPageList.String())
	blog.WriteHTML(blogContent, "./templates/blog.html")

	gamesPage := xdparser.PageData{}
	gamesPage.ReadXDFileNative("./static/xdfiles/games.xd")

	t, d, b, f := gamesPage.GenerateHTML()
	gamesContent := fmt.Sprintf(blog.Main, t, d, b, f)
	blog.WriteHTML(gamesContent, "./templates/games.html")
}
