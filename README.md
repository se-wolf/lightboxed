# Yet another lightbox

## Initialisation

### HTML class
Wherever there is a lightbox class, there will be \[a\] light(box).
```
<img src="/img/foobar.jpg" class="lightboxed"/>
```
```
<a href="/img/foobar.jpg" class="lightboxed">I'm a link!</a>
```
```
<div class="lightboxed" data-link="/img/foobar.jpg">I'm some clickable content.</div>
```

### Javascript method
You may as well call the lightboxed function on whatever element you like.
```javascript
jQuery( 'some-element-identifier' ).lightboxed();
```

## Options

### Grouping
You may use the rel attribute to group elements.
```
<img src="/img/foobar.jpg" class="lightboxed" rel="group1" />
<img src="/img/helloworld.jpg" class="lightboxed" rel="group1" />
```

### Captions
Using the data-caption attribute you may add captions to the lightbox content.
```
<img src="/img/foobar.jpg" class="lightboxed" data-caption="What a lovely image!" />
```

### Using different URL for the lightbox than the src
If you want to link the lightbox to a larger image than the image linked in the src-attribute or if you want to link any other element to a file, you can use the data-link attribute. Note: if you dont' do this on an "img" or an "a" tag the src or the href target will be used in the lightbox.
```
<img src="/img/foobar_small.jpg" class="lightboxed" data-link="/img/foobar.jpg" />
```

### Inline content
If you'd to display inline content in the lightbox just link to the id of the content.
```
<a href="#inline-content">Click me!</a>
<div id="#inline-content">I'm some super awesome inline content</div>
```

### External content / videos
Linking to any other source than a file ending in jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg|svg|SVG|tif|TIF|bmp|BMP or to an internal id starting with # will result the lightbox embeding the content in an iframe. And yes, that will work with e.g. Youtube.
Note: using this requires the attributes data-width and data-height to be set. Otherwise the iframe will collapse.
```
<img src="/img/foobar.jpg" data-link="https://www.youtube.com/embed/dQw4w9WgXcQ" data-width="560" data-height="315" />
```