
# lycheeJS (v0.6 pre-release)

Web Documentation: [http://martens.ms/lycheeJS](http://martens.ms/lycheeJS)

lycheeJS is a JavaScript Game library that offers a
complete solution for prototyping and deployment
of HTML5 Canvas, WebGL or native OpenGL(ES) based
games inside the Web Browser or native environments.


## Other (yet unsupported) JavaScript runtimes

**Its architecture is independent of the environment which
means it will run on any theoretical JavaScript environment.**

The only requirement for such a platform is a fully implemented
[lychee.Preloader](http://martens.ms/lycheeJS/docs/api-lychee-Preloader.html)
API.

As the lychee.Preloader itself is inside the core, you only need
to implement the [lychee.Preloader.\_load](http://martens.ms/lycheeJS/docs/api-lychee-Preloader.html#lychee-Preloader-_load)
method.

For fully supporting a client-side environment, you will also
have to implement a [lychee.Renderer](http://martens.ms/lycheeJS/docs/api-lychee-Renderer.html)
and a [lychee.Input](http://martens.ms/lycheeJS/docs/api-lychee-Input.html),
but these are fully optional and only necessary if you are using
them inside your Game or App.


# lycheeJS-ADK (App Development Kit)

The [lycheeJS ADK](http://github.com/martensms/lycheeJS-adk)
is the underlying framework to deliver platforms natively.

The ADK allows you to cross-compile to different platforms
natively using a custom V8 based JIT runtime with OpenGL
bindings as the target environment. The equivalent environment
integration is the platform/v8gl inside the lycheeJS Game library.


# Limitations

## NodeJS

As NodeJS is a TTY-environment by default, there are some limitations.
You can implement an ASCII Renderer in theory, but that's up to you :)

- lychee.Input: Only **fireKey** can be used, other input methods are not supported.
- lychee.Renderer: It draws simply nothing and is an emulation layer.
- lychee.Jukebox: It plays nothing and is an emulation layer.


## Native Shipping / V8GL

The V8GL environment is the custom environment that I provide and
allows you to ship games to other platforms natively. It is part
of the **lycheeJS-ADK** project and its support for missing
features will improve with it. As this project is currently only
programmed by myself (you are invited to join development!), there
are some limitations:

- lychee.Input: Bleeding-edge freeglut has currently no Multi-Touch support.
- lychee.Jukebox: The V8GL environment has currently no support for audio playback via OpenSL/OpenAL.


## iOS

At the time this was written (November 2012), iOS based platforms
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

- lychee.physics.ParticleMagnet needs to be implemented
- Particle Demo needs to be updated with multi-touch support
- lychee.Renderer: 3D vertices and shape integration and Rasterizer (canvas buffer renderer) for platform:html
- (planned to be pushed): lychee.physics.softbody namespace


**v0.6 lycheeJS-ADK**

- bleeding-edge freeglut integration
- Completion of GLSL bindings, Shader and Buffer data types
- OpenAL/OpenSL bindings
- Rewrite Android build template
- Rewrite Windows Metro build template (via VisualStudio project)
- Add support for packaging in linux build template


# License

The lycheeJS framework is licensed under MIT License.


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

