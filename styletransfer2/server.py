import os
from flask import send_file, request, session, jsonify

import glob
import sys
if sys.version_info.major <= 2:
    from cStringIO import StringIO
else:
    from io import StringIO
import time
import json

from flask_socketio import SocketIO, emit

from flask import Flask
app = Flask(__name__, static_url_path='', static_folder=os.path.abspath('./views'))
app.secret_key = "secret"
socketio = SocketIO(app)

user_no = 1

import json
import styles

@app.route('/send_image', methods=['POST'])
def sendImage():
    print("send_image", request.files)
    file = request.files['photo']

    style = 'starrynight'

    filename, ext = os.path.splitext(os.path.basename(file.filename))

    currTime = str(int(round(time.time() * 1000)))

    originName = filename + '-' + currTime + ext
    originPath = os.path.join('./views/origins', originName)

    styledName = filename + '-' + currTime + ext
    styledPath = os.path.join('./views/styled', styledName)

    modelPath = os.path.join('./models/' + style + '.ckpt')

    file.save(originPath)

    socketio.emit('started', json.dumps({'data': 'connected!!!!'}), namespace='/events')

    socketio.emit('origin-image-uploaded', json.dumps({
        'originName': originName
    }), namespace='/visual')

    styles.generate_to_art({
        'input_img_path': originPath,
        'output_img_path': styledPath,
        'model_path': modelPath,
        'upsample_method': 'resize',
        'content_target_resize': 1.0
    })

    result = {
        'style': style,
        'originName': originName,
        'styledName': styledName,
        'createTime': currTime
    }

    socketio.emit('styled-image-generated', json.dumps(result),  namespace='/visual')
    return jsonify(result)


@app.route('/history', methods=['GET'])
def history():
    origins = glob.glob('./views/origins/*')

    results = []
    for origin in origins:
        createTime = origin[origin.rfind('-') + 1:]
        filename = os.path.basename(origin)

        createdTime, ext = os.path.splitext(os.path.basename(createTime))
        results.append({
            "originName": filename,
            "ext": ext,
            "createdTime": createdTime,
        })

    return jsonify(results)

@app.route('/', methods=['GET', 'POST'])
def index():
    return send_file('./views/index.html')

@socketio.on('connect', namespace='/visual')
def connect():
    print('connected!')
    emit('started', json.dumps({'data': 'connected'}), broadcast=True)

@socketio.on('disconnect', namespace='/visual')
def disconnect():
    print "disconnected"

@socketio.on('input_image', namespace='/visual')
def receiveInputImage(imgData):
    print('input_image', imgData)
#    emit('toss-signal', signal, broadcast=True)

@socketio.on('show-styled-request', namespace='/visual')
def showStyledRequest(imageName):
    result = {
        'originName': imageName,
        'styledName': imageName,
    }
    emit('show-styled', json.dumps({result}), broadcast=True)

if __name__ == '__main__':
#    socketio.run(app.run(host='127.0.0.1', port=8080))
    socketio.run(app, host='0.0.0.0')
