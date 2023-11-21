import twitterLogo from "./assets/twitter-logo.svg"
import {useEffect,useState,useCallback  } from "react";
import "./App.css"

// Constants
const TWITTER_HANDLE = "web3dev_"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const App = () => {

 /*
   * Essa função possui a lógica para definir se a Phantom Wallet
   * está conectada ou não
   */
 const isPhantomInstalled = window.phantom?.solana?.isPhantom

 const getProvider = () => {
  if ('phantom' in window) {
    const provider = window.phantom?.solana;

    if (provider?.isPhantom) {
      return provider;
    }
  }
  window.open('https://phantom.app/', '_blank');
};

const [walletAddress, setWalletAddress] = useState(null);

 const checkIfWalletIsConnected = useCallback( async() => {
  try {
    if (isPhantomInstalled){
      const provider = getProvider(); // see "Detecting the Provider"
      try {
        if (!provider.isConnected){
          const resp = await provider.connect({ onlyIfTrusted: true });
          console.log(resp.publicKey.toString());
        
          setWalletAddress(resp.publicKey.toString());  
        }
      } catch (err) {
        alert("Conexão rejeitada!");
    }
    } else {
      alert("Objeto Solana não encontrado! Instale a Phantom Wallet 👻");
    }
  } catch (error) {
    console.error(error);
  }
}
,[isPhantomInstalled]);

const connecDisconnecttWallet = async () => {
  if (!walletAddress)
  {
    try {
      if (isPhantomInstalled){
        const provider = getProvider(); // see "Detecting the Provider"
        try {
          if (!provider.isConnected){
            const resp = await provider.connect({ onlyIfTrusted: true });
            console.log(resp.publicKey.toString());
          
            setWalletAddress(resp.publicKey.toString());  
          }
        } catch (err) {
          alert("Conexão rejeitada!");
      }
      } else {
        alert("Objeto Solana não encontrado! Instale a Phantom Wallet 👻");
      }
    } catch (error) {
      console.error(error);
    }
  }
  else{
    try {
      if (isPhantomInstalled){
        const provider = getProvider(); // see "Detecting the Provider"
        try {
          if (provider.isConnected){
            await provider.disconnect({ onlyIfTrusted: true });
          
            setWalletAddress(null);  
          }
        } catch (err) {
          alert("Conexão rejeitada!");
      }
      } else {
        alert("Objeto Solana não encontrado! Instale a Phantom Wallet 👻");
      }
    } catch (error) {
      console.error(error);
    }
  }

};


var LABEL_CONNECT = "Conecte sua carteira";

const getLabelButtonConnect = () => {

  if (walletAddress){
    return walletAddress
  }
  return LABEL_CONNECT;
};

const renderNotConnectedContainer = () => (
  <button
    className="cta-button connect-wallet-button"
    onClick={connecDisconnecttWallet}
  >
    {getLabelButtonConnect()}
  </button>
);

/*
 * Quando seu componente 'montar' pela primeira vez, vamos verificar se
 * temos uma Phantom Wallet conectada
 */
useEffect(() => {
  const onLoad = async () => {
    await checkIfWalletIsConnected();
  };
  window.addEventListener("load", onLoad);
  return () => window.removeEventListener("load", onLoad);
}, [checkIfWalletIsConnected]);

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🖼 Meu Portal de GIF 🖼</p>
          <p className="sub-text">Veja sua coleção de GIF no metaverso ✨</p>
          {renderNotConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`feito com ❤️ por @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App
