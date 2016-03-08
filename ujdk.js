import $ from 'jquery'
import _ from 'underscore'
// import ujdkPreferences from './ujdkPreferences'

/*
 * UJDK
 *
 * A simple class for tracking the user behavior
 * and communicate with another domains.
 */
class UJDK {

	/* constructor
	 *
	 * @param domain configuratión for woopra
	 * @param ssl allow ssl connections woopra
	 * @param channel non organic traffic sources
	 * @param uj UJ name to be used by the user
	 * @param uid random user identifier
	 */
	constructor ( domain, ssl, channel, uj, uid  ) {

		if ( typeof domain === 'undefined' )
			domain = 'comparamejor.com'

		if ( typeof ssl === 'undefined' )
			ssl = true

		if ( typeof channel === 'undefined' )
			channel = 'SEM'

		if ( typeof uj === 'undefined' ) {

			if ( window.location.pathname.indexOf( '/seguros-para-vehiculos/' ) != -1 ) {

				let location = window.location.pathname.substring( 24 ).slice( 0, -1 )

				uj = location
			}

			else
				uj = 'uj40'
		}

		if ( typeof uid === 'undefined' )
			uid = `user-${ Date.now() }-${ Math.floor( ( Math.random() * 100 ) + 1 ) }`

		this._channel = channel
		this._uj = uj
		this._uid = uid
		this._is_ssl = ssl
		this._domain = domain

		$.ajax({
			// url: window.location.host == 'localhost:5000' ? 'http://localhost:5000/djson/ujdkPreferences.json' : 'https://seguros.comparamejor.com/seguros-para-vehiculos/uj40/djson/ujdkPreferences.json',
			url: 'https://gist.githubusercontent.com/danjaviacm/f6ce0acdae0a681b24fd/raw/1093d1dd8be50faaa3c51e2017a898d42298be10/ujdkPreferences.json',
			method: 'GET',
			dataType: 'json',
			success: ( ( data ) => {
				sessionStorage.wpreferences = JSON.stringify( data )
			})
		})

		this._preferences = []

		this._allowed_urls = [
        	'http://example.org:8081',
        	'https://seguros.comparamejor.com',
        	'https://unbounce.com',
        	'https://cotizar.comparamejor.com',
        	'https://comparamejor.com',
        	'http://localhost:5000'
        ]

		this._woopra = woopra

		this._user_basic_data = {
			channel: this._channel,
			uj: this._uj,
			uid: this._uid
		}

		if ( this._is_ssl ) {

			this._woopra.config({
			    ssl: true
			})
		}

		if ( typeof this._channel !== 'undefined'
			&& typeof this._uj !== 'undefined'
			&& typeof this._uid !== 'undefined'
			&& this.inIframe() == false
			&& this.overrideWUID() == false ) {

			let object = {
				id: this._uid,
				email: this._uid,
			    channel: this._channel,
			    uj: this._uj,
				referer: document.referrer
			}

			// Catch utm_sources if exists
			if ( this.getURLParameter( 'utm_campaign' ) && this.getURLParameter( 'utm_medium' ) && this.getURLParameter( 'utm_source' ) ) {
				object.utm_campaign = this.getURLParameter( 'utm_campaign' )
				object.utm_medium = this.getURLParameter( 'utm_medium' )
				object.utm_source = this.getURLParameter( 'utm_source' )
			}

			this._woopra.identify( object )

			// Remove lines from 82 to 91 if don't want to save the user into woopra in the first screen.
			let originData = {
				uj: this._uj,
				channel: this._channel,
				uid: this._uid
			}


			// Do magic here
			if ( ! localStorage.wuid && localStorage.fo != 'ccm' )
				localStorage.wuid = JSON.stringify( originData )

		}

		this.redirectTo()
		this.trackAll()
	}


	// Setters & Getters

	set allowed_urls ( url ) {
		super.allowed_urls = this._allowed_urls.push( url )
	}

	get allowed_urls () {
		return this._allowed_urls
	}

	set channel ( ch ) {
		super.channel = ch
	}

	get channel () {
		return this._channel
	}

	set uj ( uj ) {
		super.uj = uj
	}

	get uj () {
		return this._uj
	}

	set uid ( uid ) {
		super.uid = uid
	}

	get uid () {
		return this._uid
	}

	set preferences ( preferences ) {
		super.preferences = preferences
	}

	get preferences () {
		return this._preferences
	}

	get ssl () {
		return this._is_ssl
	}

	get storage() {
		return JSON.parse( localStorage.wuid )
	}

	inIframe () {
	    try {
	        return window.self !== window.top
	    } catch ( e ) {
	        return true
	    }
	}

	/*
	 * setStorage
	 *
	 * dave state of current user
	 */
	setStorage( data ) {
		localStorage.wuid = JSON.stringify( data )
	}

	/*
	 * delStorage
	 *
	 * dave state of current user
	 */
	delStorage() {
		delete localStorage.wuid
	}

	/*
	 * track
	 *
	 * allow to track any event in the client side
	 * @param evName name of event to track
	 * @param data info will be to send to woopra
	 */
	track ( evName, data ) {

		try {

			if ( typeof data !== 'undefined' ) {

				this._woopra.track( evName, data )
			}

		} catch ( e ) {

			// statements
		}
	}

	/*
 	 * trackAll
 	 *
 	 * track all posible events in the screen based in the
 	 * marketing JSON data
	 */
	trackAll() {

		// let preferences = this._preferences
		let preferences = []

		this._woopra.track( 'pv', { url: window.location.hash.substring( 1 ) || '/consultar-placa', origin: window.location.host })

		$( 'a, span, select, input, button, li' ).on( "click change submit", function( e ) {


			_.each( JSON.parse( sessionStorage.wpreferences ), ( value ) => {

				let isElement = false
				let useClass = ''
				let useId = ''

				let events = value.events

				if ( value.element.indexOf( '.' ) !== -1 ) {
					 useClass = value.element.substring( 1 )
				}

				else if ( value.element.indexOf( '#' ) !== -1 ) {
					 useId = value.element.substring( 1 )
				}

				else {
					isElement = true
				}

				if ( events.indexOf( e.type ) != -1
					&& ( ( useClass.length > 2 && value.type == e.currentTarget.localName && $( e.currentTarget ).hasClass( useClass ) ) || $( e.currentTarget ).attr( 'id' ) == useId )
					|| ( isElement && e.currentTarget.localName == value.element ) ) {


					if ( e.type == 'submit' ) {

						// e.preventDefault()
						let formData = {}

						$( e.currentTarget ).serializeArray().map( function( x ){ formData[ x.name ] = x.value })

						if ( value.fill )
							this.overrideWUID( formData )
					}

					if ( e.type == 'click' && e.currentTarget.localName == 'button' && value.fill && e.currentTarget.type == 'submit' ) {

						let formData = {}

						$( e.currentTarget ).closest( 'form' ).serializeArray().map( function( x ){ formData[ x.name ] = x.value })

						if ( formData.first_name && formData.last_name )
							formData.name = `${ formData.first_name } ${ formData.last_name }`

						this.overrideWUID( formData )

					}

					if ( e.type == 'click' && e.currentTarget.localName == 'li' && value.fill ) {

						if ( window.localStorage.wuid ) {

							let currentData = JSON.parse( window.localStorage.UJDATA )

							this.overrideWUID( JSON.parse( currentData ) )
						}
					}

					this.track( value.name || 'usuario logueandose', {
						description: value.description || `el usuario ha hecho ${ e.type } en ${ e.currentTarget.textContent }`,
						text: e.currentTarget.innerText,
						targetElement: e.currentTarget.outerHTML
					})
				}

				// else

			})

		}.bind( this ))

		// $.ajax({
	    //   	url: 'https://sheetsu.com/apis/33dcdcd9',
	    //   	method: 'GET',
	    //   	dataType: 'json',
	    //   	success: (( data ) => {
		// 		let r = 1
		//
	    //
	    //   	}),
	    //   	error: (( error ) => {
	    //   	})
	    // })

	}

	/*
 	 * openChannelTo
 	 *
 	 * create the channel of comunication to dest url
 	 * @param destURL url for bridge
 	 * @param idChannel channel name
	 */
	openChannelTo ( destURL, idChannel ) {

		if ( typeof idChannel === 'undefined' )
			idChannel = 'receiverChannel'

		let receiverChannel = document.getElementById( idChannel )

		let nullate = [ null, 'null' ]

		if ( nullate.indexOf( receiverChannel ) != -1 ) {

			// Create the tag into the page
			let iframe = document.createElement( 'iframe' )

			// Set iframe attrs
			iframe.width = 0
			iframe.height = 0
			iframe.id = idChannel
			iframe.style.display = 'none'
			iframe.src = destURL

			document.body.appendChild( iframe )
		}

		else {
			throw new Error( 'El elemento requerido ya existia anteriormente, por favor cambia el ID' )
		}
	}

	/*
     * getURLParameter
     *
     * get params from url
     */
    getURLParameter ( name ) {
          return decodeURIComponent(( new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }


	/*
	 * redirectTo
	 *
	 * redirect user according to params
	 */
	redirectTo () {

		// According to domain change urls
		if ( window.location.host == 'cotizar.comparamejor.com' ) {

			this.openChannelTo( 'https://seguros.comparamejor.com/seguros-para-vehiculos/uj40/' )

			let originData = {
				uj: this._uj,
				channel: this._channel,
				uid: this._uid
			}

			$( '#lp-pom-button-23' ).on( 'click', ( e ) => {

				e.preventDefault()


				this.sendMessage( originData, 'https://seguros.comparamejor.com/seguros-para-vehiculos/uj40/' )

				window.location.href = e.currentTarget.href

			})
		}
	}


	/*
	 * sendMessage
	 *
	 * send a custom message to the destiny url in the same
	 * or another domain
	 * @param message message to send
	 * @param domain message receiver domain
	 * @idChannel channel bridge name
	 */
	sendMessage ( message, domain, idChannel ) {

		if ( typeof idChannel === 'undefined' )
			idChannel = 'receiverChannel'

		let receiver = document.getElementById( idChannel ).contentWindow

		receiver.postMessage( message, domain )
	}

	/*
	 * receiveMessage
	 *
	 * receive message from origin window and manage received data
	 * set info package between origin domain and the bridge
	 * @param event event passed to the final or destininy domain
	 */
	receiveMessage ( event ) {

        let origin = event.origin

        let allowedURLs = this._allowed_urls || [
        	'http://example.org:8081',
        	'https://seguros.comparamejor.com',
        	'https://unbounce.com',
        	'https://cotizar.comparamejor.com',
        	'http://cotizar.comparamejor.com',
        	'https://comparamejor.com',
        	'http://localhost:5000'
        ]

		if ( allowedURLs.indexOf( origin ) == -1 ) {
			throw new Error( 'No tienes permisos de acceso para realizar esta fucking acción.' )
		}


		// Do magic here
		if ( ! localStorage.wuid ) {
			localStorage.fo = 'ccm'
			localStorage.wuid = JSON.stringify( event.data )
		}

	}

	/*
	 * overrideWUID
	 *
	 * override object
	 */
	overrideWUID ( data ) {

		if ( localStorage.wuid ) {

			let originData = JSON.parse( localStorage.wuid )

			// override object instance
			this._uid = originData.uid
			this._channel = originData.channel
			this._uj = originData.uj

			// Common object passed to woopra
			let object = {
				id: this._uid,
				email: this._uid,
			    channel: this._channel,
			    uj: this._uj,
				referer: document.referrer
			}

			// Catch utm_sources if exists
			if ( this.getURLParameter( 'utm_campaign' ) && this.getURLParameter( 'utm_medium' ) && this.getURLParameter( 'utm_source' ) ) {
				object.utm_campaign = this.getURLParameter( 'utm_campaign' )
				object.utm_medium = this.getURLParameter( 'utm_medium' )
				object.utm_source = this.getURLParameter( 'utm_source' )
			}

			// Populate user info if exists additional data
			if ( typeof data !== 'undefined' ) {
				object = Object.assign( data, object )
			}

			// identify the user with the new data
			this._woopra.identify( object )

			return true
		}

		else {

			if ( typeof data !== 'undefined' ) {

				// Common object passed to woopra
				let object = {
					id: this._uid,
					email: this._uid,
				    channel: this._channel,
				    uj: this._uj,
					referer: document.referrer
				}

				// Catch utm_sources if exists
				if ( this.getURLParameter( 'utm_campaign' ) && this.getURLParameter( 'utm_medium' ) && this.getURLParameter( 'utm_source' ) ) {
					object.utm_campaign = this.getURLParameter( 'utm_campaign' )
					object.utm_medium = this.getURLParameter( 'utm_medium' )
					object.utm_source = this.getURLParameter( 'utm_source' )
				}


				// Populate user info if exists additional data
				if ( typeof data !== 'undefined' ) {
					object = Object.assign( data, object )
				}

				// identify the user with the new data
				this._woopra.identify( object )

				return true
			}

			return false
		}
	}


	/*
	 * send
	 *
	 * send wuid to the server for making possible recover it
	 * in the near future
	 */
	 send ( wuid ) {
		 // prepare data to be send to server
	 }


 	/*
 	 * populate
 	 *
 	 * populate woopra data on each step
 	 */
	 populate ( data ) {
		 // save data form user and assign into woopra's info into identify method
	 }


	/*
 	 * log
 	 *
 	 * log data
 	 * @param data data for log
	 */
	log ( data ) {

		console.log( data )

		debugger
	}

}

export default new UJDK()
