from autograd import numpy as np
from autograd import grad
import numpy as N
import autograd.numpy.random as random



class LSTM:
    def __init__(self, input_size=1, hidden_size=50, output_size=1, learning_rate=0.001, momentum=0.1):
        # Parameters
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        self.lr = learning_rate
        self.momentum=momentum
        self.m = {}  # First moment estimates
        self.v = {}  # Second moment estimates
        self.t = 0
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
        self.velocity={
            'Wi': N.zeros_like(self.Wi), 'Wf': N.zeros_like(self.Wf), 'Wo': N.zeros_like(self.Wo), 'Wc': N.zeros_like(self.Wc), 'Wy': N.zeros_like(self.Wy),
            'bi': N.zeros_like(self.bi), 'bf': N.zeros_like(self.bf), 'bo': N.zeros_like(self.bo), 'bc': N.zeros_like(self.bc), 'by': N.zeros_like(self.by)
        }
        
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))
    
    def forward_pass(self,params, x_sequence):
            
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
    

    
    def forward_passB(self, params, X_SEQ):
        
        def forward(params, x_sequence):
        
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
    
        Y_SEQ=[]
        for x in X_SEQ:
            temp_y ,_ =forward(params,x)
            Y_SEQ.append( temp_y )
    
        Y_SEQ = np.array(Y_SEQ)
        return Y_SEQ
    
    def loss_function(self, params, x_sequence, y_true):
            y_pred= self.forward_passB(params, x_sequence)
            loss = np.mean((y_pred - y_true)**2) 
            # print(loss)
            return loss
    def train(self, X, y, epochs):
        # previous_error=-1
        
        momentum = 0
        # Create gradient function using autograd
        grad_loss = grad(self.loss_function, argnum=0)
        BATCHSIZE= 64
        gradients=0
        for epoch in range(epochs):
            total_loss = 0
            for i in range(0,int(len(X)/BATCHSIZE)):
                offset = i*BATCHSIZE
                stride = BATCHSIZE
                x_seq = X[offset:offset+stride,:]
                y_true = y[offset:offset+stride,:]
                
                # Compute loss
                loss = self.loss_function(self.params, x_seq, y_true)
                total_loss += loss
                
                # Compute gradients using autograd
                gradients = grad_loss(self.params, x_seq, y_true)
                
                # Update parameters
                for param_name in self.params:
                    self.velocity[param_name] = momentum* self.velocity[param_name]- self.lr * N.array(gradients[param_name])
                    # print(gradients)
                    self.params[param_name] += self.velocity[param_name] 
            # total_loss/=len(X)
            print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss:.4f}")
            
            
            grad_norm = sum(N.linalg.norm(grad) for grad in gradients.values())
            if grad_norm < 1e-4:
                print(f"Gradient norm {grad_norm:.6f} too small, stopping training.")
                break
                
    
    def forward(self, x_sequence):
        return self.forward_pass(self.params, x_sequence)