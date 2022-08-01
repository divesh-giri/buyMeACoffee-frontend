import classes from "../styles/Home.module.css";
import Head from "next/head";
import { useMemo, useState } from "react";
import { ethers } from "ethers";
import abi from "../utils/BuyMeACoffee.json";

const Home = () => {
  const contractAddress = "0x0ADCeA22C7880D4884dc9feE05206f22457F8465";
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState();
  const [name, setName] = useState();
  const [message, setMessage] = useState();
  const [memos, setMemos] = useState();

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWalletHandler = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error("Please install Metamask!");
      }
      // request for accounts
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error.message);
    }
  };

  const buyCoffee = async (ethValue) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("Buying Coffee....");
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy Your Coffee!",
          { value: ethers.utils.parseEther(ethValue) }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);
        console.log("coffee purchased");

        // clear form fields
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getAllMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useMemo(() => {
    isWalletConnected();
    getMemos();
  }, []);

  return (
    <>
      <div className={classes.container}>
        <Head>
          <title>Buy a Coffee for Divesh</title>
          <meta name="description" content="Tipping site" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={classes.main}>
          <h1 className={classes.title}>Buy Divesh a Coffee!</h1>
          {currentAccount ? (
            <div className={classes.card}>
              <form>
                <div>
                  <label>Name</label>
                  <br />

                  <input
                    id="name"
                    type="text"
                    placeholder="anon"
                    onChange={onNameChange}
                    value={name}
                  />
                </div>
                <br />
                <div>
                  <label>Send Divesh a message</label>
                  <br />

                  <textarea
                    rows={3}
                    placeholder="Enjoy your coffee!"
                    id="message"
                    onChange={onMessageChange}
                    value={message}
                    required
                  ></textarea>
                </div>
                <br />
                <div>
                  <button type="button" onClick={buyCoffee.bind(null, "0.001")}>
                    Send 1 Coffee for 0.001ETH
                  </button>
                  <br />
                  <br />
                  <button type="button" onClick={buyCoffee.bind(null, "0.002")}>
                    Send 1 large Coffee for 0.002ETH
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button onClick={connectWalletHandler}>Connect to a wallet!</button>
          )}
          {memos ? (
            <div className={`${classes.card} ${classes.memo}`}>
              <h2>Memos</h2>
              {memos.map((memo, idx) => {
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid",
                      borderRadius: "5px",
                      padding: "5px",
                      margin: "5px",
                    }}
                  >
                    <p style={{ fontWeight: "bold" }}>"{memo.message}"</p>
                    <p>
                      From: {memo.name} at {memo.timestamp.toString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </main>
      </div>
    </>
  );
};

export default Home;
