
# lycheeJS (v0.5)

Web Documentation: [http://martens.ms/lycheeJS](http://martens.ms/lycheeJS)

lycheeJS is a JavaScript Game library that offers a
complete environment for prototyping and deployment
of HTML5 Canvas or WebGL based games inside the Web Browser.

Its architecture is **independent of the environment** which
means it will run on any theoretical JavaScript environment.

The only requirement for such a platform is a
[lychee.Preloader](http://martens.ms/lycheeJS/docs/api-lychee-Preloader.html).

If you want to support a new client-side environment, you will
have to implement a [lychee.Renderer](http://martens.ms/lycheeJS/docs/api-lychee-Renderer.html)
and a [lychee.Input](http://martens.ms/lycheeJS/docs/api-lychee-Input.html).


# lycheeJS-ADK (App Development Kit)

The [lycheeJS ADK](http://github.com/martensms/lycheeJS-adk)
is the underlying framework to deliver platforms natively.

The ADK allows you to cross-compile to different platforms
natively using a custom V8 based JIT runtime with OpenGL
bindings as the target environment. The equivalent environment
integration is the platform/v8gl inside the lycheeJS Game library.


# Limitations

At the time this was written (August 2012), iOS based platforms
are only deliverable natively using a WebView (WebKit) implementation,
because custom JIT runtimes are not allowed. Blame Apple for not
offering a high-performance alternative, not me.

Sound issues on iOS 5 and earlier versions are known due to Apple's
crappy implementation using iTunes in the background. These issues
are gone with iOS6+ due to the WebKitAudioContext (WebAudio API)
availability.


# Roadmap

The Roadmap is work in progress and may not be up to date, but it 
gives you an overview of what is currently being implemented.


**v0.6 lycheeJS**

- lychee.Input for platform:nodejs
- lychee.Track and lychee.Jukebox for platform:v8gl
- lychee.Renderer: 3D vertices and shape integration and Rasterizer (canvas buffer renderer) for platform:html
- lychee.physics.ParticleMagnet needs to be implemented
- (planned to be pushed): lychee.physics.softbody namespace


**v0.6 lycheeJS-ADK**

- bleeding-edgre freeglut integration
- Completion of GLSL bindings, Shader and Buffer data types
- OpenAL/OpenSL bindings
- Rewrite Android build template
- Rewrite Windows Metro build template (via VisualStudio project)
- Add support for packaging in Debian/Ubuntu build template


# License

The lycheeJS framework is licensed under MIT License.


# Features

I'm not a marketing guy, so I don't give a shit on
selling you stuff. it's open source, grab the demos
and grab the code, dude!


# Examples and Game Boilerplate

There is the [Game Boilerplate](http://martens.ms/lycheeJS/game/boilerplate)
and the [Jewelz Game](http://martens.ms/lycheeJS/game/jewelz) that show you
how to develop a real cross-platform game and best practices in high-performance
JavaScript code.


The example source codes are all available at the github repository:

[Link to game folder on github](https://github.com/martensms/lycheeJS/tree/master/game)


# Documentation

The documentation is available in on the web at [http://martens.ms/lycheeJS](http://martens.ms/lycheeJS)
or at the [lycheeJS-docs github repository](https://github.com/martensms/lycheeJS-docs)

