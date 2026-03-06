package main

import (
	"fmt"
	"net/http"
	"slices"
	"syscall/js"
)

type Tag struct {
	kind  []string
	inner string
}

func (pd *PageData) addTag(flag Flag, indexes []int) {
	var tag Tag
	switch flag {
	case TITLE:
		tag.kind = append(tag.kind, "h1")
	case DATE:
		tag.kind = append(tag.kind, "i")
	case CHAPTER:
		tag.kind = append(tag.kind, "h2")
	case SECTION:
		tag.kind = append(tag.kind, "h3")
	case PARAGRAPH:
		tag.kind = append(tag.kind, "p")
	case BLOCKQUOTE:
		tag.kind = append(tag.kind, "blockquote")
	case TASKTRUE:
		tag.kind = append(tag.kind, "li")
		tag.kind = append(tag.kind, "input")
	case TASKFALSE:
		tag.kind = append(tag.kind, "li")
		tag.kind = append(tag.kind, "input")
	case LIST:
		tag.kind = append(tag.kind, "li")
	case CODE:
		tag.kind = append(tag.kind, "pre")
		tag.kind = append(tag.kind, "code")
	case FOOTER:
		tag.kind = append(tag.kind, "em")
	default:
		panic("[ERROR] Flag is not valid")
	}
	var text string
	if len(indexes) == 1 {
		textIndex := indexes[0]
		text = pd.texts[textIndex]
	} else {
		for _, textIndex := range indexes {

			text += pd.texts[textIndex]
			if flag == CODE {
				text += "\n"
			}
			if slices.Contains(pd.newLineIndex, textIndex+1) {
				text += "\n"
			}
		}
	}
	tag.inner = text

	doc := js.Global().Get("document")
	element := doc.Call("createElement", tag.kind[0])
	body := doc.Call("getElementById", "body")

	switch flag {
	case TITLE:
		title := doc.Call("getElementById", "title")
		date := title.Get("firstChild")
		element.Set("textContent", tag.inner)
		title.Call("insertBefore", element, date)
	case DATE:
		date := doc.Call("getElementById", "date")
		element.Set("textContent", tag.inner)
		date.Call("appendChild", element)
	case TASKTRUE:
		element := doc.Call("createElement", tag.kind[0])
		body.Call("appendChild", element)

		input := doc.Call("createElement", tag.kind[1])
		input.Set("type", "checkbox")
		input.Set("disabled", true)
		input.Set("checked", true)

		element.Call("appendChild", input)
		element.Call("appendChild", doc.Call("createTextNode", " "+tag.inner))
	case TASKFALSE:
		element := doc.Call("createElement", tag.kind[0])
		body.Call("appendChild", element)

		input := doc.Call("createElement", tag.kind[1])
		input.Set("type", "checkbox")
		input.Set("disabled", true)
		input.Set("checked", false)

		element.Call("appendChild", input)
		element.Call("appendChild", doc.Call("createTextNode", " "+tag.inner))
	case LIST:
		element.Set("innerHTML", tag.inner)
		body.Call("appendChild", element)
	case CODE:
		body.Call("appendChild", element)

		code := doc.Call("createElement", tag.kind[1])
		tag.kind = append(tag.kind, "pre")
		tag.kind = append(tag.kind, "code")
		code.Set("textContent", tag.inner)
		element.Call("appendChild", code)
	case FOOTER:
		footer := doc.Call("getElementById", "footer")
		element.Set("textContent", tag.inner)
		footer.Call("appendChild", element)
	default:
		element.Set("textContent", tag.inner)
		body.Call("appendChild", element)

	}
}

func (pd *PageData) ReadXDFileWASM(path string) {
	response, err := http.Get(path)
	if err != nil {
		fmt.Println("Error when opening xd file : ", err)
		return
	}
	defer response.Body.Close()

	pd.readLine(response.Body)
	fmt.Println("[INFO] XD file ", path, "loaded")
}

func (pd *PageData) InsertGeneratedHTML() {
	for _, pageData := range pd.pageMapArray {
		for key, val := range pageData {
			pd.addTag(key, val)
		}
	}
}
