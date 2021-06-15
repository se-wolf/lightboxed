;( function ( $ , window , document , undefined ) {
	
	var pluginName = 'Lightboxed';
	var ver	= '0.3';
	var namespace = 'lightboxed--';
	
	function Lightboxed ( element , options ) { 
		jQuery.extend( 
			this , 
			{
				Obj : element ,  
				_name : pluginName ,  
				_defaults : $.fn.lightboxed.defaults ,  
				options : jQuery.extend( {} , $.fn.lightboxed.defaults , options ) , 
				uniq : 'id' + ( new Date() ).getTime() , 
				lightbox : {} , 
				cache : {} , 
				index : false , 
				touch : {} , 
				phantoms : { left : false , right : false } , 
			} 
		);
		this.init(); 
	}
	
	function debounce(func, wait, immediate) { var timeout; return function() { var context = this, args = arguments; var later = function() { timeout = null; if (!immediate) func.apply(context, args); }; var callNow = immediate && !timeout; clearTimeout(timeout); timeout = setTimeout(later, wait); if (callNow) func.apply(context, args); }; };
	
	function touchCoordinates ( event ) {
		return {
			clientX : /touch/.test( event.type ) ? ( event.originalEvent || event ).changedTouches[0][ 'clientX' ] : event[ 'clientX' ] , 
			clientY : /touch/.test( event.type ) ? ( event.originalEvent || event ).changedTouches[0][ 'clientY' ] : event[ 'clientY' ] , 
			pageX : /touch/.test( event.type ) ? ( event.originalEvent || event ).changedTouches[0][ 'pageX' ] : event[ 'pageX' ] , 
			pageY : /touch/.test( event.type ) ? ( event.originalEvent || event ).changedTouches[0][ 'pageY' ] : event[ 'pageY' ] , 
			timestamp : Date.now()
		};
	}
	
	function scrollPreventDefault( event ) {
		event = event || window.event;
		if ( event.preventDefault ) { event.preventDefault(); }
		event.returnValue = false;  
	}

	function preventDefaultForScrollKeys( event ) {
		var keys = { 37 : 1 , 38 : 1 , 39 : 1 , 40 : 1 };
		if ( keys[ event.keyCode ] ) {
			scrollPreventDefault( event );
			return false;
		}
	}

	function disableScroll() {
		if ( window.addEventListener ) { window.addEventListener( 'DOMMouseScroll' , scrollPreventDefault , false ); }
		window.onwheel = scrollPreventDefault;
		window.onmousewheel = document.onmousewheel = scrollPreventDefault;
		window.ontouchmove  = scrollPreventDefault;
		document.onkeydown  = preventDefaultForScrollKeys;
	}

	function enableScroll() {
		if ( window.removeEventListener ) { window.removeEventListener( 'DOMMouseScroll' , scrollPreventDefault , false ); }
		window.onmousewheel = document.onmousewheel = null; 
		window.onwheel = null; 
		window.ontouchmove = null;  
		document.onkeydown = null;  
	}
	
	$.extend( Lightboxed.prototype , {
		
		init : function () {
			var that = this;
			this.CacheObj = ( jQuery( document ).find( '#' + namespace + 'cache' ).length > 0 ) ? jQuery( document ).find( '#' + namespace + 'cache' ) : jQuery( '<div id="' + namespace + 'cache" />' ).appendTo( 'body' );
			this.cache.container = jQuery( '<div id="' + this.uniq + '" />' ).appendTo( this.CacheObj );
			this.cache.content = jQuery( '<div class="' + namespace + 'cached_content" />' ).appendTo( this.cache.container );
			if ( this.Obj.length > 1 ) { this.cache.thumbs = jQuery( '<div class="' + namespace + 'cached_thumbs" />' ).appendTo( this.cache.container ); }
			this.Obj.each( function () { that.addToCache( this ); } );
			this.lightbox.container = ( jQuery( document ).find( '#' + namespace + 'container' ).length > 0 ) ? jQuery( document ).find( '#' + namespace + 'container' ) : jQuery( '<div id="' + namespace + 'container" />' ).addClass( this.options.lightboxCloseClass ).appendTo( 'body' );
			this.lightbox.stage = ( this.lightbox.container.find( '#' + namespace + 'stage' ).length > 0 ) ? this.lightbox.container.find( '#' + namespace + 'stage' ) : jQuery( '<div id="' + namespace + 'stage" />' ).appendTo( this.lightbox.container );
			this.lightbox.content = ( this.lightbox.stage.find( '#' + namespace + 'content' ).length > 0 ) ? this.lightbox.stage.find( '#' + namespace + 'content' ) : jQuery( '<div id="' + namespace + 'content" />' ).appendTo( this.lightbox.stage );
			this.lightbox.thumbs = ( this.lightbox.container.find( '#' + namespace + 'thumbs' ).length > 0 ) ? this.lightbox.container.find( '#' + namespace + 'thumbs' ) : jQuery( '<div id="' + namespace + 'thumbs" />' ).appendTo( this.lightbox.stage );
			this.lightbox.close = ( this.lightbox.container.find( '#' + namespace + 'bttn_close' ).length > 0 ) ? this.lightbox.container.find( '#' + namespace + 'bttn_close' ) : jQuery( '<div id="' + namespace + 'bttn_close" />' ).appendTo( this.lightbox.container );
			this.lightbox.prev = ( this.lightbox.container.find( '#' + namespace + 'bttn_prev' ).length > 0 ) ? this.lightbox.container.find( '#' + namespace + 'bttn_prev' ) : jQuery( '<div id="' + namespace + 'bttn_prev" />' ).appendTo( this.lightbox.container );
			this.lightbox.next = ( this.lightbox.container.find( '#' + namespace + 'bttn_next' ).length > 0 ) ? this.lightbox.container.find( '#' + namespace + 'bttn_next' ) : jQuery( '<div id="' + namespace + 'bttn_next" />' ).appendTo( this.lightbox.container );
			this.registerEvents( 'init' );
		} , 
		
		addToCache : function ( element ) {
			
			if ( ( jQuery( element ).attr( 'data-link' ) || jQuery( element ).attr( 'href' ) || jQuery( element ).attr( 'data-src' ) || jQuery( element ).attr( 'src' ) ).match( 'jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg|svg|SVG|tif|TIF|bmp|BMP' ) ) {
				var content = jQuery( '<img />' )
					.attr( 'src' , ( jQuery( element ).attr( 'data-link' ) || jQuery( element ).attr( 'href' ) || jQuery( element ).attr( 'src' ) ) )
					.attr( 'alt' , jQuery( element ).attr( 'alt' ) )
					.attr( 'data-caption' , jQuery( element ).attr( 'data-caption' ) );
			} else if ( ( jQuery( element ).attr( 'data-link' ) || jQuery( element ).attr( 'href' ) ).match( '^#' ) && jQuery( ( jQuery( element ).attr( 'data-link' ) || jQuery( element ).attr( 'href' ) ) ).length > 0 ) {
				var content = jQuery( jQuery( element ).attr( 'data-link' ) || jQuery( element ).attr( 'href' ) ).html();
			} else {
				var content = jQuery( '<iframe />' )
					.attr( 'src' , ( jQuery( element ).attr( 'data-link' ) || jQuery( element ).attr( 'href' ) ) )
					.attr( 'width' , jQuery( element ).attr( 'data-width' ) )
					.attr( 'height' , jQuery( element ).attr( 'data-height' ) )
					.attr( 'allowfullscreen' , 'true' );
			}
			
			jQuery( '<div class="' + namespace + 'frame" />' )
				.append( content )
				.append( ( jQuery( element ).attr( 'data-caption' ) !== undefined ) ? jQuery( '<div class="' + namespace + 'caption" />' ).html( jQuery( element ).attr( 'data-caption' ) ) : '' )
				.appendTo( this.cache.content );
			
			if ( this.Obj.length > 1 ) {
				jQuery( '<div class="' + namespace + 'thumb" />' )
				.append( 
					jQuery( '<div class="' + namespace + 'thumb_border" />' )
					.append( jQuery( '<img />' ).attr( 'src' , ( jQuery( element ).attr( 'data-src' ) || jQuery( element ).attr( 'src' ) || jQuery( element ).attr( 'data-link' ) || jQuery( element ).attr( 'href' ) ) ) ) 
				)
				.appendTo( this.cache.thumbs );
			}
		} , 
		
		resizeContent : function () {
			var that = this;
			this.lightbox.content
				.width( jQuery( window ).width() * this.lightbox.content.children().length )
				.height( this.cache.thumbs ? jQuery( window ).height() - this.lightbox.thumbs.height() : jQuery( window ).height() )
				.children()
					.width( jQuery( window ).width() - 2 * this.options.content.spacing )
					.height( this.lightbox.content.height() );
			this.lightbox.content.children().each( function ( index ) { jQuery( this ).css( 'left' , jQuery( window ).width() * index + that.options.content.spacing ) } );
		} , 
		
		open : function ( event , element ) {
			var that = this;
			if ( this.cache.thumbs && this.options.thumbs !== false ) { 
				this.lightbox.thumbs
					.width( ( this.options.thumbs.size + this.options.thumbs.spacing ) * ( this.cache.thumbs.children().length ) )
					.height( this.options.thumbs.size + 2 * this.options.thumbs.spacing )
					.html( this.cache.thumbs.clone( true ).html() )
					.show()
					.children()
						.width( this.options.thumbs.size )
						.height( this.options.thumbs.size )
						.css( 'margin' , this.options.thumbs.spacing + 'px ' + this.options.thumbs.spacing / 2 + 'px' );
				this.registerEvents( 'thumbs' ); 
				this.lightbox.next.show();
				this.lightbox.prev.show();
			}
			this.lightbox.content.html( this.cache.content.clone( true ).html() );
			if ( this.lightbox.content.children().length > 1 && this.options.loop == true ) {
				this.phantoms = {
					left : jQuery( this.lightbox.content.children().get( this.lightbox.content.children().length - 1 ) ).clone().addClass( namespace + 'phantom-left' ).prependTo( this.lightbox.content ) , 
					right : jQuery( this.lightbox.content.children().get( 1 ) ).clone().addClass( namespace + 'phantom-right' ).appendTo( this.lightbox.content )
				};
			}
			this.resizeContent();
			this.change( event , this.Obj.index( element ) );
			this.registerEvents( 'lightbox' );
			this.lightbox.container.toggleClass( this.options.lightboxCloseClass + ' ' + this.options.lightboxOpenClass ).fadeIn( this.options.delay );
			disableScroll();
		} , 
		
		close : function ( event ) {
			var that = this;
			this.deregisterEvents();
			this.lightbox.container.toggleClass( this.options.lightboxCloseClass + ' ' + this.options.lightboxOpenClass ).fadeOut( this.options.delay , function () { 
				that.lightbox.container.attr( 'style' , '' );
				that.lightbox.content.html( '' ).attr( 'style' , '' );
				that.lightbox.thumbs.html( '' ).attr( 'style' , '' ).hide();
				that.lightbox.next.hide();
				that.lightbox.prev.hide();
				that.index = false;
				enableScroll();
			} );
		} , 
		
		change : function ( event , element ) {
			var that = this;
			var index = ( typeof( element ) == 'number' ) ? element : jQuery( element ).index();
			if ( this.lightbox.content.children().length > 1 ) {
				var offset = ( this.options.loop === true ) ? jQuery( window ).width() * - ( index + 1 ) : jQuery( window ).width() * - index;
				this.lightbox.content.css({
					'-webkit-transform' : 'translate(' + offset + 'px,0)' ,
					'-moz-transform' : 'translate(' + offset + 'px,0)' ,
					'-ms-transform' : 'translate(' + offset + 'px,0)' ,
					'-o-transform' : 'translate(' + offset + 'px,0)' ,
					'transform' : 'translate(' + offset + 'px,0)' , 
					'transition' : this.options.delay + 'ms transform'
				});
				if ( index == -1 ) {
					index = this.lightbox.content.children().length - 3;
					setTimeout( function () {
						var offset = jQuery( window ).width() * - ( index + 1 );
						that.lightbox.content.css({
							'-webkit-transform' : 'translate(' + offset + 'px,0)' ,
							'-moz-transform' : 'translate(' + offset + 'px,0)' ,
							'-ms-transform' : 'translate(' + offset + 'px,0)' ,
							'-o-transform' : 'translate(' + offset + 'px,0)' ,
							'transform' : 'translate(' + offset + 'px,0)' , 
							'transition' : 'none'
						});
					} , this.options.delay );
				} else if ( index == this.lightbox.content.children().length - 2 ) {
					index = 0;
					setTimeout( function () {
						var offset = jQuery( window ).width() * - ( index + 1 );
						that.lightbox.content.css({
							'-webkit-transform' : 'translate(' + offset + 'px,0)' ,
							'-moz-transform' : 'translate(' + offset + 'px,0)' ,
							'-ms-transform' : 'translate(' + offset + 'px,0)' ,
							'-o-transform' : 'translate(' + offset + 'px,0)' ,
							'transform' : 'translate(' + offset + 'px,0)' , 
							'transition' : 'none'
						});
					} , this.options.delay );
				} else {
					setTimeout( function () {
						that.lightbox.content.css( 'transition' , 'none' );
					} , this.options.delay );
				}
				this.lightbox.content.children().removeClass( namespace + 'active' );
				jQuery( this.lightbox.content.children().get( index + 1 ) ).addClass( namespace + 'active' );
				this.lightbox.thumbs.children().removeClass( namespace + 'active' );
				jQuery( this.lightbox.thumbs.children().get( index ) ).addClass( namespace + 'active' );
				if ( this.lightbox.thumbs.width() > jQuery( window ).width() ) {
					var offset = - ( index * ( this.options.thumbs.size + this.options.thumbs.spacing ) ) - ( ( this.options.thumbs.size + this.options.thumbs.spacing ) / 2 );
					this.lightbox.thumbs.css({
						'-webkit-transform' : 'translate(' + offset + 'px,0)' ,
						'-moz-transform' : 'translate(' + offset + 'px,0)' ,
						'-ms-transform' : 'translate(' + offset + 'px,0)' ,
						'-o-transform' : 'translate(' + offset + 'px,0)' ,
						'transform' : 'translate(' + offset + 'px,0)' , 
						'transition' : this.options.delay + 'ms transform'
					});
				}
			}
			this.index = index;
		} , 
		
		next : function ( event ) { 
			var that = this; 
			this.change( event , this.index + 1 );
		} , 
		
		prev : function ( event ) { 
			var that = this; 
			this.change( event , that.index - 1 );
		} , 
		
		startTouch : function ( event , target ) {
			var that = this;
			event.preventDefault();
			this.touch = {
				start : touchCoordinates( event ) , 
				target : { x : parseFloat( target.css( 'transform' ).split( ',' )[4] ) , y : parseFloat( target.css( 'transform' ).split( ',' )[5] ) }
			};
		} , 
		
		endTouch : function ( event , target ) {
			var that = this;
			event.preventDefault();
			var delta = { clientX : touchCoordinates( event ).clientX - this.touch.start.clientX , clientY : touchCoordinates( event ).clientY - this.touch.start.clientY , pageX : touchCoordinates( event ).pageX - this.touch.start.pageX , pageY : touchCoordinates( event ).pageY - this.touch.start.pageY , timestamp : touchCoordinates( event ).timestamp - this.touch.start.timestamp };
			if ( target == this.lightbox.content ) {
				if ( ( delta.clientX > 0 ? delta.clientX : -delta.clientX ) > ( jQuery( window ).width() * this.options.swipe.horizontalOffset ) ) { 
					( delta.clientX > 0 ) ? this.prev( event ) : this.next( event ); 
				} else {
					this.lightbox.content.css({
						'-webkit-transform' : 'translate(' + this.touch.target.x + 'px,0)' ,
						'-moz-transform' : 'translate(' + this.touch.target.x + 'px,0)' ,
						'-ms-transform' : 'translate(' + this.touch.target.x + 'px,0)' ,
						'-o-transform' : 'translate(' + this.touch.target.x + 'px,0)' ,
						'transform' : 'translate(' + this.touch.target.x + 'px,0)' , 
						'transition' : this.options.delay + 'ms transform'
					});
					setTimeout( function () { 
						that.lightbox.content.css( 'transition' , 'none' ); 
					} , this.options.delay );
				}
				if ( ( delta.clientY > 0 ? delta.clientY : -delta.clientY ) > ( jQuery( window ).height() * this.options.swipe.verticalOffset ) ) { 
					this.close( event );
				} else {
					this.lightbox.container.css({
						'-webkit-transform' : 'translate(0,0) scale(1)' ,
						'-moz-transform' : 'translate(0,0) scale(1)' ,
						'-ms-transform' : 'translate(0,0) scale(1)' ,
						'-o-transform' : 'translate(0,0) scale(1)' ,
						'transform' : 'translate(0,0) scale(1)' , 
						'opacity' : '1' , 
						'transition' : this.options.delay + 'ms all'
					});
					setTimeout( function () { 
						that.lightbox.container.attr( 'style' , 'display: block;' ); 
					} , this.options.delay );
				}
			} 
		} , 
		
		moveTouch : function ( event , target ) {
			var that = this;
			event.preventDefault();
			var delta = { clientX : touchCoordinates( event ).clientX - this.touch.start.clientX , clientY : touchCoordinates( event ).clientY - this.touch.start.clientY , pageX : touchCoordinates( event ).pageX - this.touch.start.pageX , pageY : touchCoordinates( event ).pageY - this.touch.start.pageY , timestamp : touchCoordinates( event ).timestamp - this.touch.start.timestamp };
			if ( target == this.lightbox.content && ( delta.clientX > 0 ? delta.clientX : -delta.clientX ) > 10 ) {
				var horizontalOffset = this.touch.target.x + delta.clientX;
				target.css({
					'-webkit-transform' : 'translate(' + horizontalOffset + 'px,0)' ,
					'-moz-transform' : 'translate(' + horizontalOffset + 'px,0)' ,
					'-ms-transform' : 'translate(' + horizontalOffset + 'px,0)' ,
					'-o-transform' : 'translate(' + horizontalOffset + 'px,0)' ,
					'transform' : 'translate(' + horizontalOffset + 'px,0)'
				});
			}
			if ( target == this.lightbox.content && ( delta.clientY > 0 ? delta.clientY : -delta.clientY ) > 30 ) {
				var verticalOffset = 0 + delta.clientY;
				var scale = ( jQuery( window ).height() - ( delta.clientY > 0 ? delta.clientY : -delta.clientY ) ) / jQuery( window ).height();
				this.lightbox.container.css({
					'-webkit-transform' : 'translate(0,' + verticalOffset + 'px) scale(' + scale + ')' ,
					'-moz-transform' : 'translate(0,' + verticalOffset + 'px) scale(' + scale + ')' ,
					'-ms-transform' : 'translate(0,' + verticalOffset + 'px) scale(' + scale + ')' ,
					'-o-transform' : 'translate(0,' + verticalOffset + 'px) scale(' + scale + ')' , 
					'transform' : 'translate(0,' + verticalOffset + 'px) scale(' + scale + ')' , 
					'opacity' : scale
				});
			}
		} , 
		
		registerEvents : function ( scope ) {
			var that = this;
			if ( scope == 'init' ) {
				this.Obj.each( function () { jQuery( this ).on( 'click' , function ( event ) { event.preventDefault(); that.open.call( that , event , this ); } ); } );
			}
			if ( scope == 'lightbox' ) {
				this.lightbox.close.on( 'click' , function ( event ) { that.close.call( that , event ); } );
				this.lightbox.next.on( 'click' , function ( event ) { that.next.call( that , event ); } );
				this.lightbox.prev.on( 'click' , function ( event ) { that.prev.call( that , event ); } );
				jQuery( window ).on( 'resize' , function ( event ) { that.resizeContent.call( that , event ); } );
				this.lightbox.content.on( 'touchstart' , function ( event ) { that.startTouch.call( that , event , that.lightbox.content ); } );
				this.lightbox.content.on( 'touchend' , function ( event ) { that.endTouch.call( that , event , that.lightbox.content ); } );
				this.lightbox.content.on( 'touchmove' , function ( event ) { that.moveTouch.call( that , event , that.lightbox.content ); } );
			}
			if ( scope == 'thumbs' ) {
				this.lightbox.thumbs.children().on( 'click' , function ( event ) { that.change.call( that , event , this ); } );
				this.lightbox.thumbs.children().on( 'touchend' , function ( event ) { that.change.call( that , event , this ); } );
				this.lightbox.thumbs.on( 'touchstart' , function ( event ) { that.startTouch.call( that , event , that.lightbox.thumbs ); } );
				this.lightbox.thumbs.on( 'touchend' , function ( event ) { that.endTouch.call( that , event , that.lightbox.thumbs ); } );
				this.lightbox.thumbs.on( 'touchmove' , function ( event ) { that.moveTouch.call( that , event , that.lightbox.thumbs ); } );
			}
		} , 
		
		deregisterEvents : function () {
			var that = this;
			this.lightbox.close.off();
			this.lightbox.next.off();
			this.lightbox.prev.off();
			jQuery( window ).off( 'resize' );
			this.lightbox.content.off();
			this.lightbox.thumbs.children().off();
			this.lightbox.thumbs.off();
		}
		
	} );
	
	$.fn.indexof = function ( a ) { var f; for ( var i = 0; i < jQuery( this ).length; i++ ) { if ( jQuery( this ).get(i) == a ) { f = i; } } return f; };
	
	$.fn.lightboxed = function ( options ) { 
		var createInstance = function () { if ( !$.data( this , "plugin_" + pluginName ) ) { $.data( this , "plugin_" + pluginName , new Lightboxed( jQuery( this ) , options ) ); } };
		var grouped = {};
		jQuery( this ).filter( '[rel]' ).each( function () { var group = jQuery( this ).attr( 'rel' ); if ( grouped.hasOwnProperty( group ) ) { grouped[ group ].push( this ); } else { grouped[ group ] = [ this ]; } } );
		jQuery.each( grouped , createInstance );
		jQuery.each( jQuery( this ).filter( ':not([rel])' ) , createInstance );
		return this; 
	};
	
	$.fn.indexOf = function ( e ) { 
		var ret = false;
		var string = jQuery( e )[0].outerHTML;
		jQuery( this ).each( function ( i , e ) { if ( jQuery( this )[0].outerHTML == string ) { ret = i; return false; } } );
		return ret;
	};
	
	$.fn.lightboxed.defaults = {
		lightboxOpenClass : namespace + 'lightbox_open' , 
		lightboxCloseClass : namespace + 'lightbox_close' , 
		delay : 500 , 
		loop : true , 
		thumbs : {
			size : 50 , 
			spacing : 10
		} , 
		content : {
			spacing : 10
		} , 
		swipe : {
			horizontalOffset : 0.2 , 
			verticalOffset : 0.33 , 
		}
	};
	
} )( jQuery , window , document );

jQuery( window ).on( 'load' , function () { jQuery( '.lightboxed' ).lightboxed(); } );