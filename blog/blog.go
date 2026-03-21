package main

import (
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
