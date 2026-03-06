package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"slices"
)

type Flag uint8

const (
	TITLE Flag = iota
	DATE
	CHAPTER
	SECTION
	BLOCKQUOTE
	CODE
	PARAGRAPH
	TASKTRUE
	TASKFALSE
	LIST
	FOOTER
)

type PageMap map[Flag][]int //

type PageData struct {
	pageMapArray []PageMap
	texts        []string
	keys         []Flag
	newLineIndex []int // texts index to know add new line
}

func (pd *PageData) addData(flag string) {
	var currentFlag Flag
	switch flag {
	case "title":
		currentFlag = TITLE
	case "date":
		currentFlag = DATE
	case "chapter":
		currentFlag = CHAPTER
	case "section":
		currentFlag = SECTION
	case "paragraph":
		currentFlag = PARAGRAPH
	case "blockquote":
		currentFlag = BLOCKQUOTE
	case "tasktrue":
		currentFlag = TASKTRUE
	case "taskfalse":
		currentFlag = TASKFALSE
	case "list":
		currentFlag = LIST
	case "code":
		currentFlag = CODE
	case "footer":
		currentFlag = FOOTER
	default:
		panic("[ERROR] Flag is not valid: " + flag)
	}

	newPageMap := PageMap{}
	pd.keys = append(pd.keys, currentFlag)
	pd.pageMapArray = append(pd.pageMapArray, newPageMap)
}

func (pd *PageData) generateTagAsString(flag Flag, indexes []int) string {
	var openTag string
	var closeTag string
	switch flag {
	case TITLE:
		openTag = "<h1>"
		closeTag = "</h1>"
	case DATE:
		openTag = "<i>"
		closeTag = "</i>"
	case CHAPTER:
		openTag = "<h2>"
		closeTag = "</h2>"
	case SECTION:
		openTag = "<h3>"
		closeTag = "</h3>"
	case PARAGRAPH:
		openTag = "<p>"
		closeTag = "</p>"
	case BLOCKQUOTE:
		openTag = "<blockquote>"
		closeTag = "</blockquote>"
	case TASKTRUE:
		openTag = "<li><input disabled=\"\" type=\"checkbox\">"
		closeTag = "</li>"
	case TASKFALSE:
		openTag = "<li><input checked disabled=\"\" type=\"checkbox\">"
		closeTag = "</li>"
	case LIST:
		openTag = "<li>"
		closeTag = "</li>"
	case CODE:
		openTag = "<pre><code>"
		closeTag = "</code></pre>"
	case FOOTER:
		openTag = "<em>"
		closeTag = "</em>"
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

	return openTag + text + closeTag
}

func (pd *PageData) readLine(reader io.Reader) {
	scanner := bufio.NewScanner(reader)

	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading xd file : ", err)
		return
	}

	for scanner.Scan() {
		line := scanner.Text()
		pd.texts = append(pd.texts, line)
	}

	for index, text := range pd.texts {
		// check for Tag
		if len(text) != 0 && text[0] == '[' {
			flag := text[1 : len(text)-1]
			pd.addData(flag)
			//check for new line
		} else if len(text) == 0 {
			pd.newLineIndex = append(pd.newLineIndex, index)
			// appending after tags
		} else {
			lastIndex := len(pd.pageMapArray) - 1
			lastKey := pd.keys[len(pd.keys)-1]
			pd.pageMapArray[lastIndex][lastKey] = append(pd.pageMapArray[lastIndex][lastKey], index)
		}
	}

	// fmt.Println("[INFO] Total texts    line : ", len(pd.texts))
	// fmt.Println("[INFO] Total pageData data : ", len(pd.pageMapArray))
	// fmt.Println("[INFO] Total newlines      : ", len(pd.newLineIndex))
	// fmt.Println("[INFO] Index to addnewlines: ", pd.newLineIndex)
}

func (pd *PageData) ReadXDFileNative(path string) {
	file, err := os.Open(path)
	if err != nil {
		fmt.Println("Error when opening xd file : ", err)
		return
	}
	defer file.Close()

	pd.readLine(file)
}

func (pd *PageData) GenerateHTML() (string, string, string, string) {
	var title, date, body, footer string

	for _, pageData := range pd.pageMapArray {
		for key, val := range pageData {
			switch key {
			case TITLE:
				title = pd.generateTagAsString(key, val)
			case DATE:
				date = pd.generateTagAsString(key, val)
			case FOOTER:
				footer = pd.generateTagAsString(key, val)
			default:
				body += pd.generateTagAsString(key, val)
			}
		}
	}
	return title, date, body, footer
}
