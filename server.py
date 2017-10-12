import os
from flask import send_file, request, session, jsonify
from flask_cors import CORS
import threading

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

if not os.path.exists('./results'):
    os.makedirs('./results')

STYLE_TYPES = [
    {
        'name': 'starrynight',
        'modelPath': os.path.join('./styletransfer2/models/starrynight.ckpt'),
        'styleSrc': '/styles/starrynight.jpg'
    },
    {
        'name': 'wave',
        'modelPath': os.path.join('./styletransfer1/models/wave.ckpt'),
        'styleSrc': '/styles/wave.jpg'
    },
    {
        'name': 'scream',
        'modelPath': os.path.join('./styletransfer1/models/scream.ckpt'),
        'styleSrc': '/styles/scream.jpg'
    },
    {
        'name': 'udnie',
        'modelPath': os.path.join('./styletransfer1/models/udnie.ckpt'),
        'styleSrc': '/styles/udnie.jpg'
    },
    {
        'name': 'rainprincess',
        'modelPath': os.path.join('./styletransfer1/models/rainprincess.ckpt'),
        'styleSrc': '/styles/rainprincess.jpg'
    },
    {
        'name': 'wreck',
        'modelPath': os.path.join('./styletransfer1/models/wreck.ckpt'),
        'styleSrc': '/styles/wreck.jpg'
    },
]

@app.route('/selected-style', methods=['GET'])
def selected_style():
    styleId = request.args.get('styleId')
    data = {
        'styleId': styleId
    }
    socketio.emit('selected-style', json.dumps(data),  namespace='/visual')
    return jsonify(data)

@app.route('/send-image', methods=['POST'])
def sendImage():
    print("send-image", request.files)

    file = request.files['photo']
    styleId = int(request.form.get('styleType'))

    style = STYLE_TYPES[styleId]

    filename, ext = os.path.splitext(os.path.basename(file.filename))

    createdDate = str(int(round(time.time() * 1000)))

    originName = filename + '-' + createdDate + '-' + str(styleId) + ext
    originPath = os.path.join('./origins', originName)

    resultName = filename + '-' + createdDate + '-' + str(styleId) + ext
    resultPath = os.path.join('./results', resultName)

    file.save(originPath)

    socketio.emit('started', json.dumps({'data': 'connected!!!!'}), namespace='/events')

    socketio.emit('origin-image-uploaded', json.dumps({
        'originName': originName
    }), namespace='/visual')

    if (styleId == 0):
        styler2.generate_to_art({
            'input_img_path': originPath,
            'output_img_path': resultPath,
            'model_path': style['modelPath'],
            'upsample_method': 'resize',
            'content_target_resize': 1.0
        })
    else:
        styler1.generate_to_art({
            'input_img_path': originPath,
            'output_img_path': resultPath,
            'model_path': style['modelPath']})

    result = {
        'originSrc': '/origins/' + originName,
        'styleSrc': style['styleSrc'],
        'resultSrc': '/results/' + resultName,
        'styleName': style['name'],
        'styleId': styleId,
        'createdDate': createdDate
    }

    socketio.emit('result-generated', json.dumps(result),  namespace='/visual')

    history = _history()
    socketio.emit('current-history', json.dumps(history),  namespace='/visual', broadcast=True)
    return jsonify(result)

@app.route('/get-styles-meta', methods=['GET'])
def getStylesMeta():
    return jsonify(STYLE_TYPES)

@app.route('/history', methods=['GET'])
def getHistoryHttp():
    return jsonify(_history())

def _history():
    origins = glob.glob('./origins/*')

    results = []
    for origin in origins:
        filename = os.path.basename(origin)
        _, createDate, styleId = filename.split('-')
        styleId, _ = os.path.splitext(os.path.basename(styleId))
        style = STYLE_TYPES[int(styleId)]

        results.append({
            "originSrc": '/origins/'+filename,
            "styleSrc": style['styleSrc'],
            "resultSrc": '/results/'+filename,
            "styleName": style['name'],
            "styleId": styleId,
            "createDate": createDate,
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

@socketio.on('select-result-request', namespace='/visual')
def showStyledRequest(requestMeta):
    print('select-result-request', requestMeta)
    requestMeta['styleId'] = int(requestMeta['styleId'])
    emit('selected-result', json.dumps(requestMeta), broadcast=True)

@socketio.on('get-styles-meta', namespace='/visual')
def getStylesMeta():
    emit('styles-meta', json.dumps(STYLE_TYPES), broadcast=True)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', async_mode=None)
