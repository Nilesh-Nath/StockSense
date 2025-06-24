from autograd import numpy as np
from autograd import grad
import numpy as N
import numpy.random as random
import matplotlib.pyplot as plt

class LSTM:
    def __init__(self, input_size=1, hidden_size=50, output_size=1, learning_rate=0.001, beta=0.4):
        # Parameters
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        self.lr = learning_rate
        # self.momentum=momentum
        self.beta= beta
        self.max_grad_norm = 10.0
        
        # self.m = {}  # First moment estimates
        # self.v = {}  # Second moment estimates
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
                
                # Forget gate
                f = self.sigmoid(np.dot(params['Wf'], combined) + params['bf'])
                # Input gate
                i = self.sigmoid(np.dot(params['Wi'], combined) + params['bi'])
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
                
                # Forget gate
                f = self.sigmoid(np.dot(params['Wf'], combined) + params['bf'])
                # Input gate
                i = self.sigmoid(np.dot(params['Wi'], combined) + params['bi'])
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
    
    def train(self, X, y, epochs, batch_size=15):
        grad_loss = grad(self.loss_function, argnum=0)
        BATCHSIZE = batch_size
        gradients = 0
        self.loss_history = []  # Reset loss history

        for epoch in range(epochs):
            total_loss = 0
            for i in range(0, int(len(X) / BATCHSIZE)):
                offset = i * BATCHSIZE
                stride = BATCHSIZE
                x_seq = X[offset:offset + stride, :]
                y_true = y[offset:offset + stride, :]

                # Compute loss
                loss = self.loss_function(self.params, x_seq, y_true)
                total_loss += loss

                # Compute gradients using autograd
                gradients = grad_loss(self.params, x_seq, y_true)

                # Update parameters
                for param_name in self.params:
                    gradients[param_name] = N.clip(gradients[param_name], -self.max_grad_norm, self.max_grad_norm)

                    self.velocity[param_name] = self.beta * self.velocity[param_name] + (1 - self.beta) * N.array(gradients[param_name]) ** 2
                    self.params[param_name] -= (self.lr / (1e-8 + N.sqrt(self.velocity[param_name]))) * gradients[param_name]

            avg_loss = total_loss / (len(X) / BATCHSIZE)
            self.loss_history.append(avg_loss)  # Store the average loss for the epoch

            print(f"Epoch {epoch + 1}/{epochs}, Loss: {avg_loss:.4f}")

            grad_norm = sum(N.linalg.norm(grad) for grad in gradients.values())
            if grad_norm < 1e-4:
                print(f"Gradient norm {grad_norm:.6f} too small, stopping training.")
                break

        # Create convergence plot and store it in the model
        self.save_convergence_plot()
        
        return self.loss_history
    
    def save_convergence_plot(self):
        """Creates and stores the convergence plot in the model"""
        import io
        import matplotlib.pyplot as plt
        
        plt.figure(figsize=(10, 6))
        plt.plot(range(1, len(self.loss_history) + 1), self.loss_history, marker='o', linestyle='-')
        plt.xlabel("Epochs")
        plt.ylabel("Loss")
        plt.title("Convergence of LSTM Model")
        plt.grid()
        
        # Save plot to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        plt.close()
        
        # Store the plot data directly in the model
        self.convergence_plot_data = buf.getvalue()
        
        return self.convergence_plot_data
        
    def get_convergence_plot(self):
        """Returns the stored convergence plot data"""
        if self.convergence_plot_data is None and len(self.loss_history) > 0:
            self.save_convergence_plot()
        return self.convergence_plot_data
    
    def forward(self, x_sequence):
        return self.forward_pass(self.params, x_sequence)