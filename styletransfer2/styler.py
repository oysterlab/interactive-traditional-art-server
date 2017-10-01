import tensorflow as tf
import numpy as np
from im_transf_net import create_net
import argparse
import utils

def generate_to_art(param):
    print('generate_to_art')

    input_img_path = param['input_img_path']
    output_img_path = param['output_img_path']
    model_path = param['model_path']
    upsample_method = param['upsample_method']
    content_target_resize = param['content_target_resize']

    # Read + preprocess input image.
    img = utils.imread(input_img_path)
    img = utils.imresize(img, content_target_resize)
    img_4d = img[np.newaxis, :]

    tf.reset_default_graph()
    
    # Create the graph.
    with tf.variable_scope('img_t_net'):
        X = tf.placeholder(tf.float32, shape=img_4d.shape, name='input')
        Y = create_net(X, upsample_method)

    # Filter the input image.
    with tf.Session() as sess:
        print 'Loading up model...'
        # Saver used to restore the model to the session.
        saver = tf.train.Saver()

        saver.restore(sess, model_path)
        print 'Evaluating...'
        img_out = sess.run(Y, feed_dict={X: img_4d})
        sess.close()


    # Postprocess + save the output image.
    print 'Saving image.'
    img_out = np.squeeze(img_out)
    utils.imwrite(output_img_path, img_out)

    print 'Done.'
