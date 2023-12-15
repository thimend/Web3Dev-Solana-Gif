import twitterLogo from "./assets/twitter-logo.svg";
import {useEffect,useState,useCallback  } from "react";
import "./App.css";
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import kp from './keypair.json'


// Constants
const TWITTER_HANDLE = "web3dev_"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

// SystemProgram é uma referencia ao 'executor' (runtime) da Solana!
// Cria um par de chaves para a conta que irá guardar os dados do GIF.
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Obtém o id do nosso programa do arquivo IDL.
const addrees = idl.metadata.address;
console.log(addrees);
const programID = new PublicKey(idl.metadata.address);

// Define nossa rede para devnet.
const network = clusterApiUrl('devnet');

// Controla como queremos 'saber' quando uma transação está 'pronta'.
const opts = {
  preflightCommitment: "processed"
}

const App = () => {

 /*
   * Essa função possui a lógica para definir se a Phantom Wallet
   * está conectada ou não
   */
 const isPhantomInstalled = window.phantom?.solana?.isPhantom

 const getProviderToConnect = useCallback (async() => 
 {
  if ('phantom' in window) {
    const provider = window.phantom?.solana;

    if (provider?.isPhantom) {
      return provider;
    }
  }
  window.open('https://phantom.app/', '_blank');
},[]);

const getProviderToInteract = useCallback (async () => 
{
 if ('solana' in window) {
   const connection = await new Connection(network, opts.preflightCommitment);
   const provider = await new AnchorProvider(
     connection, window.solana, opts.preflightCommitment,
   );
     return provider;
 }
 //window.open('https://phantom.app/', '_blank');
},[]);

const [walletAddress, setWalletAddress] = useState(null);
const [inputValue, setInputValue] = useState("");
const [gifList, setGifList] = useState([]);

 const checkIfWalletIsConnected = useCallback( async() => {
  try {
    if (isPhantomInstalled){
      const provider = await getProviderToConnect(); // see "Detecting the Provider"
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
,[isPhantomInstalled, getProviderToConnect] );

const connecDisconnecttWallet = async () => {
  if (!walletAddress)
  {
    try {
      if (isPhantomInstalled){
        const provider = await getProviderToConnect(); // see "Detecting the Provider"
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
        const provider = await getProviderToConnect(); // see "Detecting the Provider"
        try {
          if (provider.isConnected){
            await provider.disconnect();
          
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

const renderConnectedContainer = () => {
  // Se chegarmos aqui, significa que a conta do programa não foi inicializada.
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Fazer inicialização única para conta do programa GIF
          </button>
        </div>
      )
    } 
    // Caso contrário, estamos bem! A conta existe. Usuários podem submeter GIFs.
    else {
      return(
        <div className="connected-container">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendGif();
            }}
          >
            <input
              type="text"
              placeholder="Entre com o link do GIF!"
              value={inputValue}
              onChange={onInputChange}
            />
            <button type="submit" className="cta-button submit-gif-button">
              Enviar
            </button>
          </form>
          <div className="gif-grid">
            {/* Usamos o indice (index) como chave (key), também o 'src' agora é 'item.gifLink' */}
            {gifList.map((item, index) => (
              <div className="gif-item" key={index}>
                <img src={item.gifLink} />
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

const onInputChange = (event) => {
  const { value } = event.target;
  setInputValue(value);
};

const sendGif = async () => {
  if (inputValue.length === 0) {
    console.log("Nenhum link de GIF foi dado!")
    return
  }
  setInputValue('');
  console.log('Link do GIF:', inputValue);
  try {
    const provider = await getProviderToInteract();
    const program = new Program(idl, programID, provider);

    await program.rpc.addGif(inputValue, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    });
    console.log("GIF foi enviado com sucesso para o programa", inputValue)

    await getGifList();
  } catch (error) {
    console.log("Erro enviando GIF:", error)
  }
};

const renderMainContainer = () => (
  <div className="connected-container">
    <button
      className="cta-button connect-wallet-button"
      onClick={connecDisconnecttWallet}
    >
      {getLabelButtonConnect()}
    </button>
    </div>);

const createGifAccount = async () => {
  try {
    const provider = await getProviderToInteract();
    const program = new Program(idl, programID, provider);

    const _systemProgramId = web3.SystemProgram.programId;
    console.log("SystemProgram.programId = ",_systemProgramId);
    
    console.log("ping")
    let tx = await program.rpc.startStuffOff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: _systemProgramId,
      },
      signers: [baseAccount]
    });
    console.log("📝 Sua assinatura de transação", tx);
    console.log("Criado uma nova BaseAccount com o endereço:", baseAccount.publicKey.toString())
    await getGifList();

  } catch(error) {
    console.log("Erro criando uma nova BaseAccount:", error)
  }
}

const getGifList = useCallback( async() => {
  try {
    const provider = await getProviderToInteract();
    const program = new Program(idl, programID, provider);
    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    
    console.log("Obtive a conta", account)
    setGifList(account.gifList)
    

  } catch (error) {
    console.log("Erro no método getGifList: ", error)
    setGifList(null);
  }
},[getProviderToInteract])

useEffect(() => {
  if (walletAddress) {
    console.log("Obtendo lista de GIFs...");

    // Chama o programa da Solana aqui.

    getGifList();
    // Define o estado
    //setGifList(TEST_GIFS);
  }
}, [getGifList, walletAddress]);

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
          <p className="header">🖼 Meu Portal de GIFs do Mengão 🖼</p>
          <p className="sub-text">Veja sua coleção de GIF no metaverso ✨</p>
           {renderMainContainer()}
            {walletAddress && renderConnectedContainer()}  
        </div>
        <div className="connected-container">
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
