import numpy as np

class LSTM:
    def __init__(self, input_size=1, hidden_size=50, output_size=1, learning_rate=0.001):
        # Parameters
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.output_size = output_size
        self.lr = learning_rate
        
        # Gates weights (input, forget, output, cell)
        self.Wi = np.random.randn(hidden_size, input_size + hidden_size) * 0.01
        self.Wf = np.random.randn(hidden_size, input_size + hidden_size) * 0.01
        self.Wo = np.random.randn(hidden_size, input_size + hidden_size) * 0.01
        self.Wc = np.random.randn(hidden_size, input_size + hidden_size) * 0.01
        
        # Output weights
        self.Wy = np.random.randn(output_size, hidden_size) * 0.01
        
        # Biases
        self.bi = np.zeros((hidden_size, 1))
        self.bf = np.zeros((hidden_size, 1))
        self.bo = np.zeros((hidden_size, 1))
        self.bc = np.zeros((hidden_size, 1))
        self.by = np.zeros((output_size, 1))
        
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))
    
    def tanh(self, x):
        return np.tanh(x)
    
    def forward(self, x_sequence):
        h_prev = np.zeros((self.hidden_size, 1))
        c_prev = np.zeros((self.hidden_size, 1))
        self.cache = []
        
        for x in x_sequence:
            x = x.reshape(-1, 1)
            combined = np.vstack((x, h_prev))
            
            # Input gate
            i = self.sigmoid(np.dot(self.Wi, combined) + self.bi)
            # Forget gate
            f = self.sigmoid(np.dot(self.Wf, combined) + self.bf)
            # Output gate
            o = self.sigmoid(np.dot(self.Wo, combined) + self.bo)
            # Cell state
            c_candidate = self.tanh(np.dot(self.Wc, combined) + self.bc)
            c_prev = f * c_prev + i * c_candidate
            # Hidden state
            h_prev = o * self.tanh(c_prev)
            
            self.cache.append((x, combined, i, f, o, c_candidate, h_prev, c_prev))
        
        # Output layer
        y = np.dot(self.Wy, h_prev) + self.by
        return y, h_prev
    
    def backward(self, dy):
        dWi, dWf, dWo, dWc = np.zeros_like(self.Wi), np.zeros_like(self.Wf), np.zeros_like(self.Wo), np.zeros_like(self.Wc)
        dbi, dbf, dbo, dbc = np.zeros_like(self.bi), np.zeros_like(self.bf), np.zeros_like(self.bo), np.zeros_like(self.bc)
        dWhy = np.dot(dy, self.cache[-1][6].T)
        dby = dy
        
        dh_next = np.zeros_like(self.cache[0][6])
        dc_next = np.zeros_like(self.cache[0][7])
        
        for t in reversed(range(len(self.cache))):
            x, combined, i, f, o, c_candidate, h_prev, c_prev = self.cache[t]
            
            dh = np.dot(self.Wy.T, dy) + dh_next
            do = dh * self.tanh(c_prev)
            do_raw = do * o * (1 - o)
            
            dc = dc_next + (dh * o * (1 - self.tanh(c_prev)**2))
            dc_candidate = dc * i
            dc_candidate_raw = dc_candidate * (1 - c_candidate**2)
            
            di = dc * c_candidate
            di_raw = di * i * (1 - i)
            
            df = dc * c_prev
            df_raw = df * f * (1 - f)
            
            dWc_t = np.dot(dc_candidate_raw, combined.T)
            dWo_t = np.dot(do_raw, combined.T)
            dWf_t = np.dot(df_raw, combined.T)
            dWi_t = np.dot(di_raw, combined.T)
            
            dcomb = (np.dot(self.Wc.T, dc_candidate_raw) +
                     np.dot(self.Wo.T, do_raw) +
                     np.dot(self.Wf.T, df_raw) +
                     np.dot(self.Wi.T, di_raw))
            
            dh_prev = dcomb[self.input_size:, :]
            dc_prev = f * dc
            
            # Accumulate gradients
            dWi += dWi_t
            dWf += dWf_t
            dWo += dWo_t
            dWc += dWc_t
            dbi += di_raw
            dbf += df_raw
            dbo += do_raw
            dbc += dc_candidate_raw
            
            dh_next = dh_prev
            dc_next = dc_prev
        
        # Update parameters
        self.Wi -= self.lr * dWi
        self.Wf -= self.lr * dWf
        self.Wo -= self.lr * dWo
        self.Wc -= self.lr * dWc
        self.Wy -= self.lr * dWhy
        self.bi -= self.lr * dbi
        self.bf -= self.lr * dbf
        self.bo -= self.lr * dbo
        self.bc -= self.lr * dbc
        self.by -= self.lr * dby

    def train(self, X, y, epochs):
        for epoch in range(epochs):
            total_loss = 0
            for i in range(len(X)):
                x_seq = X[i]
                y_true = y[i]
                
                # Forward pass
                y_pred, _ = self.forward(x_seq)
                loss = np.mean((y_pred - y_true)**2)
                total_loss += loss
                
                # Backward pass
                dy = 2 * (y_pred - y_true) / y_pred.shape[0]
                self.backward(dy)
            
            print(f"Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(X):.4f}")