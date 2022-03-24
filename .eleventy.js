const Image = require("@11ty/eleventy-img");
const mdContainer = require('markdown-it-container');

async function imageShortcode(
  src,
  alt,
  class_ = "rounded-sm mx-auto",
  sizes = "(min-width: 30em) 50vw, 100vw",
) {
  let metadata = await Image(src, {
    widths: [200, 400, 600],
    formats: ["avif", "jpeg"],
    outputDir: "./public/images",
    urlPath: "/images",
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
    class: class_,
  };

  console.log(imageAttributes)

  return Image.generateHTML(metadata, imageAttributes) + `<p class="text-xs italics text-center -mt-2">${alt}</p>`;
}

module.exports = (config) => {
  config.addNunjucksAsyncShortcode("image", imageShortcode);
  config.addLiquidShortcode("image", imageShortcode);
  config.addJavaScriptFunction("image", imageShortcode);

  const markdownIt = new require("markdown-it")({
    typographer: true,
    linkify: true,
    html: true,
  });

  markdownIt.use(mdContainer, 'note');

  const markdownItAnchor = require("markdown-it-anchor");
  markdownIt.use(markdownItAnchor);

  config.setLibrary("md", markdownIt);

  config.addPlugin(require("eleventy-plugin-nesting-toc"), {
    tags: ["h2", "h3", "h4"],
  });

  config.addPlugin(require("@11ty/eleventy-plugin-syntaxhighlight"));
  config.addPlugin(require("@11ty/eleventy-plugin-rss"));

  config.addFilter("dateDisplay", require("./filters/date-display.js"));

  config.setBrowserSyncConfig({
    files: ["public/**/*"],
    open: true,
  });

  config.setDataDeepMerge(true);

  config.addCollection("postsWithoutDrafts", (collection) =>
    [...collection.getFilteredByGlob("src/posts/*.md")].filter(
      (post) => !post.data.draft
    )
  );

  return {
    pathPrefix: require("./src/_data/site.json").baseUrl,
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
  };
};
