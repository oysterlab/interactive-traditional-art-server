import os
from flask import send_file, request, session, jsonify
from flask_cors import CORS

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
app = Flask(__name__, static_url_path='', static_folder=os.path.abspath('./'))
app.secret_key = "secret"
CORS(app)

socketio = SocketIO(app)

user_no = 1

import json
from styletransfer1 import styler as styler1
from styletransfer2 import styler as styler2

if not os.path.exists('./origins'):
    os.makedirs('./origins')

if not os.path.exists('./styled'):
    os.makedirs('./styled')    

@app.route('/send_image', methods=['POST'])
def sendImage():
    print("send_image", request.files)
    file = request.files['photo']
    styleType = request.form.get('styleType')
    
    print('styleType', styleType)

    style = 'starrynight'

    filename, ext = os.path.splitext(os.path.basename(file.filename))

    currTime = str(int(round(time.time() * 1000)))

    originName = filename + '-' + currTime + ext
    originPath = os.path.join('./origins', originName)

    styledName = filename + '-' + currTime + ext
    styledPath = os.path.join('./styled', styledName)

    modelPath = os.path.join('./styletransfer2/models/' + style + '.ckpt')

    file.save(originPath)

    socketio.emit('started', json.dumps({'data': 'connected!!!!'}), namespace='/events')

    socketio.emit('origin-image-uploaded', json.dumps({
        'originName': originName
    }), namespace='/visual')

    if (styleType == '1'):
        styler2.generate_to_art({
            'input_img_path': originPath,
            'output_img_path': styledPath,
            'model_path': modelPath,
            'upsample_method': 'resize',
            'content_target_resize': 1.0
        })
    else:  
        modelMap = {
            '2': 'wave.ckpt',
            '3': 'rain_princess.ckpt',
            '4': 'scream.ckpt',
            '5': 'udnie.ckpt',
            '6': 'wreck.ckpt',
        }
        modelName = modelMap[styleType]
        modelPath = './styletransfer1/models/' + modelName
        styler1.generate_to_art({
            'input_img_path': originPath,
            'output_img_path': styledPath,
            'model_path': modelPath})

    result = {
        'style': style,
        'originName': originName,
        'styledName': styledName,
        'createTime': currTime
    }

    socketio.emit('styled-image-generated', json.dumps(result),  namespace='/visual')

    history = _history()
    socketio.emit('current-history', json.dumps(history),  namespace='/visual', broadcast=True)
    return jsonify(result)


@app.route('/history', methods=['GET'])
def getHistoryHttp():
    origins = glob.glob('./origins/*')

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

    return jsonify(_history())

def _history():
    origins = glob.glob('./origins/*')

    results = []
    for origin in origins:
        createTime = origin[origin.rfind('-') + 1:]
        filename = os.path.basename(origin)

        createdTime, ext = os.path.splitext(os.path.basename(createTime))
        results.append({
            "originName": 'origins/'+filename,
            "styledName": 'styled/'+filename,
            "ext": ext,
            "createdTime": createdTime,
        })

    return results

@app.route('/', methods=['GET', 'POST'])
def index():
    return send_file('./test-view/index.html')

@socketio.on('get-history', namespace='/visual')
def getHistorySocket():
    history = _history()
    emit('current-history', json.dumps(history), broadcast=True)

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

@socketio.on('show-styled-request', namespace='/visual')
def showStyledRequest(imageName):
    result = {
        'originName': imageName,
        'styledName': imageName,
    }
    emit('show-styled', json.dumps({result}), broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')
