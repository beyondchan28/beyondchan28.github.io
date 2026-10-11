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

func generatePageNavigation(chapterTexts []string) string {
	var links strings.Builder

	for _, ct := range chapterTexts {
		link := fmt.Sprintf (`<a href="#%s">%s</a>`, ct, ct)
		links.WriteString(link)
	}

	return fmt.Sprintf(blog.PageNavigation, links.String())
}

func main() {
	// NOTE: Generate index HTML
	index := xdparser.PageData{}
	index.ReadXDFileNative("./static/xdfiles/index.xd")

	title, date, body, footer := index.GenerateHTML()
	indexContent := fmt.Sprintf(blog.Main, title, date, "", body, footer)

	blog.WriteHTML(indexContent, "./index.html")

	//NOTE: Prepare Blog page
	var pages []xdparser.PageData
	addPage(&pages, "page")
	addPage(&pages, "page2")
	addPage(&pages, "page3")
	addPage(&pages, "page4")
	addPage(&pages, "page5")
	addPage(&pages, "page6")
	addPage(&pages, "page7")

	for idx, pg := range pages {
		fileName := fmt.Sprintf("./templates/page%d.html", idx)

		fmt.Println(fileName)
		title, date, body, footer := pg.GenerateHTML()
		truePageNavigation := generatePageNavigation(pg.ChapterTexts)

		content := fmt.Sprintf(blog.Main, title, date, truePageNavigation, body, footer)
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
	gamesPageNavigation := generatePageNavigation(gamesPage.ChapterTexts)
	gamesContent := fmt.Sprintf(blog.Main, t, d, gamesPageNavigation, b, f)
	blog.WriteHTML(gamesContent, "./templates/games.html")
}
