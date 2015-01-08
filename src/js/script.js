(function(win, doc) {
	'use strict';

	win.app = win.app || {};

	win.app.start = function() {
		var c = doc.getElementById('glView');

		c.width = 300;
		c.height = 300;

		var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

		gl.clearColor(0.2, 0.2, 0.2, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


		var v_shader = create_shader('vs');
		var f_shader = create_shader('fs');
		var prg = create_program(v_shader, f_shader);

		var attLocation = gl.getAttribLocation(prg, 'position');
		var attStride = 3;
		var vertex_position = [
			 0.0, 1.0, 0.0,
			 1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0
		];

		var vbo = create_vbo(vertex_position);

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.enableVertexAttribArray(attLocation);

		gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);

		var m = new matIV();
		var mMatrix = m.identity(m.create());
		var vMatrix = m.identity(m.create());
		var pMatrix = m.identity(m.create());
		var mvpMatrix = m.identity(m.create());

		m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
		m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
		m.multiply(pMatrix, vMatrix, mvpMatrix);
		m.multiply(mvpMatrix, mMatrix, mvpMatrix);

		var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');

		gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.flush();

		function create_shader(id) {
			var shader;
			var scriptElement = doc.getElementById(id);

			switch(scriptElement.type) {
				case 'x-shader/x-vertex':
					shader = gl.createShader(gl.VERTEX_SHADER);
					break;

				case 'x-shader/x-fragment':
					shader = gl.createShader(gl.FRAGMENT_SHADER);
					break;

				default:
					return;
			}

			gl.shaderSource(shader, scriptElement.text);
			gl.compileShader(shader);

			if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				return shader;
			} else {
				alert(gl.getShaderInfoLog(shader));
			}
		}


		function create_program(vs, fs){
			var program = gl.createProgram();

			gl.attachShader(program, vs);
			gl.attachShader(program, fs);
			gl.linkProgram(program);

			if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
				gl.useProgram(program);
				return program;
			} else {
				alert(gl.getProgramInfoLog(program));
			}
		}


		function create_vbo(data){
			var vbo = gl.createBuffer();

			gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			return vbo;
		}

		function torus(row, column, irad, orad) {
			var pos = new Array(), col = new Array(), idx = new Array();
			for(var i = 0; i <= row; i++){
				var r = Math.PI * 2 / row * i;
				var rr = Math.cos(r);
				var ry = Math.sin(r);
				for(var ii = 0; ii <= column; ii++){
					var tr = Math.PI * 2 / column * ii;
					var tx = (rr * irad + orad) * Math.cos(tr);
					var ty = ry * irad;
					var tz = (rr * irad + orad) * Math.sin(tr);
					pos.push(tx, ty, tz);
					var tc = hsva(360 / column * ii, 1, 1, 1);
					col.push(tc[0], tc[1], tc[2], tc[3]);
				}
			}
			for(i = 0; i < row; i++){
				for(ii = 0; ii < column; ii++){
					r = (column + 1) * i + ii;
					idx.push(r, r + column + 1, r + 1);
					idx.push(r + column + 1, r + column + 2, r + 1);
				}
			}
			return [pos, col, idx];
		}
	};

	win.addEventListener('load', win.app.start);

})(this, this.document);
