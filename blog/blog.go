package main

import (
	"fmt"
	"log"
	"strconv"
	"syscall/js"
)

type Blog struct {
	front         PageData
	pages         []PageData
	currentPage   string
	clickPage     js.Func
	clickedPageId string
}

func (b *Blog) setup() {
	window := js.Global().Get("window")
	b.currentPage = (window.Get("location")).Get("pathname").String()
	fmt.Println("currentPage : ", b.currentPage)

	// NOTE: Set new blog page here
	b.addPage("page")
	b.addPage("page")
	b.addPage("page")

	switch b.currentPage {
	case "/":
		b.front.ReadXDFileWASM("./pages/front.xd")
		b.front.InsertGeneratedHTML()
	case "/blog.html":
		for idx, pageData := range b.pages {
			pageId := idx
			var titleId int
			var dateId int
			for _, pageMap := range pageData.pageMapArray {
				if v, ok := pageMap[TITLE]; ok {
					titleId = v[0]
				} else if v, ok := pageMap[DATE]; ok {
					dateId = v[0]
				}
			}
			b.generateBlogList(pageId, pageData.texts[titleId], pageData.texts[dateId])
		}
	case "/page.html":
		fmt.Println("Page id: ", b.clickedPageId)
		pageId, err := strconv.Atoi(b.clickedPageId)
		if err != nil {
			log.Fatal("failed to convert string to integer : ", err) // Handle potential errors
		}
		b.pages[pageId].InsertGeneratedHTML()
	}
}

func (b *Blog) generateBlogList(pageId int, title, date string) {
	fmt.Println(title)
	fmt.Println(date)
	doc := js.Global().Get("document")
	blogList := doc.Call("getElementById", "blog-list")
	blogItem := doc.Call("createElement", "li")
	blogItem.Set("className", "blog-item")

	link := doc.Call("createElement", "a")
	link.Set("id", pageId)
	// link.Set("href", "/page.html")
	link.Set("textContent", title)
	link.Call("addEventListener", "click",
		js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			event := args[0]
			event.Call("preventDefault")
			fmt.Println(link.Get("id"))
			b.clickedPageId = link.Get("id").String()

			// (js.Global().Get("window").Get("location")).Call("assign", "/page.html")
			// fmt.Println("Page id: ", b.clickedPageId)
			// pageId, err := strconv.Atoi(b.clickedPageId)
			// if err != nil {
			// 	log.Fatal("failed to convert string to integer : ", err) // Handle potential errors
			// }
			// b.pages[pageId].InsertGeneratedHTML()
			return nil
		}),
	)

	blogTitle := doc.Call("createElement", "div")
	blogTitle.Set("className", "blog-title")
	blogTitle.Call("appendChild", link)

	blogDate := doc.Call("createElement", "div")
	blogDate.Set("className", "published-date")
	blogDate.Set("textContent", date)

	blogItem.Call("appendChild", blogTitle)
	blogItem.Call("appendChild", blogDate)

	blogList.Call("appendChild", blogItem)

}

func (b *Blog) addPage(filename string) {
	blogDir := "./pages/blogs/"
	page := PageData{}
	page.ReadXDFileWASM(blogDir + filename + ".xd")
	b.pages = append(b.pages, page)
}
