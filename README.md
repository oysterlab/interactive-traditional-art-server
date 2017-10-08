## Dendencies
- Python 2.7
- Tensorflow 1.0.0
- Numpy
- OpenCV 3.1.0*
- Pillow 3.4.2
- scipy 0.18.1
- umpy 1.11.2

## Install
- models download
    - [Models](https://drive.google.com/drive/folders/0B9jhaT37ydSyRk9UX0wwX3BpMzQ) download to ```styletransfer1/models/```

- server setup
```
    pip install -r requirements.txt
```

- test client settup
```
    test-view> npm install
```

## Run
```
   python server.py
```
then access [http://localhost:5000](http://localhost:5000) for test


## About websocket event
connect to ```http://[host-address]:5000/visual``` by websocket

### How to send request styled image 
multipart post request 
#### parameters
- photo: image-file
- styleType: string


### Consume new styled image event
when new styled image generated, server will trigger websocket event on ```current-history``` and ```styled-image-generated```.

#### ```styled-image-generated``` event data json format
```
    {
        originSrc,
        styleSrc,
        styleName,
        createdDate
    }
```

#### ```current-history``` event data json format
```
   [
    {
        originSrc,
        styleSrc,
        styleName,
        createdDate
    },
    {
        originSrc,
        styleSrc,
        styleName,
        createdDate
    },
    ...
   ]
```


### Request current history
emit signal on websocket with ```get-history``` then server will trigger ```current-history``` event

#### ```current-history``` event data json format
```
   [
    {
        originSrc,
        styleSrc,
        styleName,
        createdDate
    },
    {
        originSrc,
        styleSrc,
        styleName,
        createdDate
    },
    ...
   ]
```