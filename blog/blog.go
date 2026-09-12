package blog

import (
	"os"
	"fmt"
)


const indexIconPath string = "../static/icon.ico"
const indexCssPath string = "./static/style.css"
const indexHomePath string = "/"
const indexBlogPath string = "./templates/blog.html"
const indexGamesPath string = "./templates/games.html"
const indexJsPath string = "./static/script.js"


const templateIconPath string = "../static/icon.ico"
const templateCssPath string = "../static/style.css"
const templateHomePath string = "../"
const templateBlogPath string = "./blog.html"
const templateGamesPath string = "./games.html"
const templateJsPath string = "../static/script.js"


var head string = `<link rel="icon" type="image/x-icon" href="%s">
<link rel="stylesheet" href="%s">
</head>

<body>
<header>
<nav class="navbar">
<div class="logo">Beyond The Screen</div>
<ul class="nav-links">
<li><a href="%s">Home</a></li>
<li><a href="%s">Blog</a></li>
<li><a href="%s">Games</a></li>
</ul>
</nav>
</header>

<div class="container">
`

var foot string = `</div>
</body>
<footer>
© 2026 Beyond The Screen | All Rights Reserved
</footer>
<script src="%s"></script>
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

func WriteHTML(content, filePath string) {
	// head is the top part of the HTML and foot is the bottom part of HTML
	var trueHead string
	var trueFoot string
	if filePath == "./index.html" {
		trueHead = fmt.Sprintf(head, indexIconPath, indexCssPath, indexHomePath, indexBlogPath, indexGamesPath)
		trueFoot = fmt.Sprintf(foot, indexJsPath)
	} else {
		trueHead = fmt.Sprintf(head, templateIconPath, templateCssPath, templateHomePath, templateBlogPath, templateGamesPath)
		trueFoot = fmt.Sprintf(foot, templateJsPath)
	}
	html :=  trueHead + content + trueFoot

	err := os.WriteFile(filePath, []byte(html), 0644)
	if err != nil {
		panic(err)
	}
}
