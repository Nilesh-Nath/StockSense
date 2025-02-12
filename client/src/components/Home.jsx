import { useState } from "react";
import Sidebar from "./Sidebar";
import StockForm from "./StockForm";

function Home(){
    const [selectedTicker, setSelectedTicker] = useState('');

    return(
        <div className="flex">
            <div style={{width:"15%"}}>
                <Sidebar onTickerSelect={setSelectedTicker} />
            </div>
            <div style={{width:"85%"}}>
                <StockForm selectedTicker={selectedTicker} />
            </div>
        </div>
    );
}


export default Home;