const tickersHandlers = new Map();

const API_KEY =
  "51e3a8b5f6554f2ead64ca96488d73ecad858dd8913e9e62298793365d5e6e40";
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const AGGREGATE_INDEX = "5";

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);
  if (type !== AGGREGATE_INDEX || newPrice === undefined) return;
  // debugger;
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
  console.log("4.api.js~addEventListener:tickersHandlers", tickersHandlers);
  console.log("=====================================");
});
function sendToWebSocket(m) {
  const stringifiedMessage = JSON.stringify(m);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}
function subscribeToTickerOnWS(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
  console.log(
    "api.js: subscribeToTickerOnWS: tickersHandlers",
    tickersHandlers
  );
}
function unsubscribeFromTickerOnWS(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}
// когда тикер обновится - вызови ф-цию cb
export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWS(ticker);
  console.log("api.js: subscribeToTicker: tickersHandlers", tickersHandlers);
};
export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWS(ticker);
};

window.tickers = tickersHandlers;
