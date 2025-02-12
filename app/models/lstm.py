from autograd import numpy as np
from autograd import grad
import autograd.numpy.random as random

class LSTM:
    def __init__(self, input_size=1, hidden_size=50, output_size=1, learning_rate=0.001):
        # Parameters
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        self.lr = learning_rate
        random.seed(42)
        
        # Gates weights (input, forget, output, cell)
        self.Wi = random.randn(hidden_size, input_size + hidden_size)
        self.Wf = random.randn(hidden_size, input_size + hidden_size)
        self.Wo = random.randn(hidden_size, input_size + hidden_size)
        self.Wc = random.randn(hidden_size, input_size + hidden_size)
        
        # Output weights
        self.Wy = random.randn(output_size, hidden_size)
        
        # Biases
        self.bi = np.zeros((hidden_size, 1))
        self.bf = np.zeros((hidden_size, 1))
        self.bo = np.zeros((hidden_size, 1))
        self.bc = np.zeros((hidden_size, 1))
        self.by = np.zeros((output_size, 1))
        
        # Dictionary for storing parameters for easier updates
        self.params = {
            'Wi': self.Wi, 'Wf': self.Wf, 'Wo': self.Wo, 'Wc': self.Wc, 'Wy': self.Wy,
            'bi': self.bi, 'bf': self.bf, 'bo': self.bo, 'bc': self.bc, 'by': self.by
        }
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))
    
    def forward_pass(self, params, x_sequence):
        
        h_prev = np.zeros((self.hidden_size, 1))
        c_prev = np.zeros((self.hidden_size, 1))
        
        for x in x_sequence:
            x = x.reshape(-1, 1)
            combined = np.vstack((x, h_prev))
            
            # Input gate
            i = self.sigmoid(np.dot(params['Wi'], combined) + params['bi'])
            # Forget gate
            f = self.sigmoid(np.dot(params['Wf'], combined) + params['bf'])
            # Output gate
            o = self.sigmoid(np.dot(params['Wo'], combined) + params['bo'])
            # Cell state
            c_candidate = np.tanh(np.dot(params['Wc'], combined) + params['bc'])
            c_prev = f * c_prev + i * c_candidate
            # Hidden state
            h_prev = o * np.tanh(c_prev)
        
        # Output layer
        y = np.dot(params['Wy'], h_prev) + params['by']
        return y, h_prev
    
    def loss_function(self, params, x_sequence, y_true):
        print("ERROR HERE")
        print(x_sequence.shape)
        y_pred, _ = self.forward_pass(params, x_sequence)
        return np.mean((y_pred - y_true)**2)
    
    def train(self, X, y, epochs):
        # Create gradient function using autograd
        grad_loss = grad(self.loss_function, argnum=0)
        
        for epoch in range(epochs):
            total_loss = 0
            for i in range(0,int(len(X)/20)):
                offset = i*20
                stride = 20
                x_seq = X[offset:offset+stride,:]
                y_true = y[offset:offset+stride,:]
                
                # Compute loss
                loss = self.loss_function(self.params, x_seq, y_true)
                total_loss += loss
                
                # Compute gradients using autograd
                gradients = grad_loss(self.params, x_seq, y_true)
                
                # Update parameters
                for param_name in self.params:
                    print(gradients)
                    self.params[param_name] -= self.lr * gradients[param_name]
            
            print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(X):.4f}")
    
    def forward(self, x_sequence):
        return self.forward_pass(self.params, x_sequence)