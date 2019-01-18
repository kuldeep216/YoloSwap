import { delay } from 'redux-saga';
import { takeLatest, call, put, select } from 'redux-saga/effects';
import { getRate, trade } from "../services/network_service";
import * as swapActions from "../actions/swapAction";
import * as accountActions from "../actions/accountAction";
import { NETWORK_ACCOUNT } from "../config/env";
import { EOS_TOKEN } from "../config/tokens";
import { MAX_DEST_AMOUNT, MIN_CONVERSION_RATE } from "../config/app";

const getTokens = state => state.token.tokens;
const getSwapState = state => state.swap;
const getAccountState = state => state.account;

function* swapToken() {
  const tokens = yield select(getTokens);
  const swap = yield select(getSwapState);
  const account = yield select(getAccountState);

  const sourceToken = tokens.find((item) => swap.sourceToken === item.name);
  const destToken = tokens.find((item) => swap.destToken === item.name);
  const sourceAmount = (+swap.sourceAmount).toFixed(sourceToken.precision);

  try {
    yield put(swapActions.setTxConfirming(true));

    const result = yield call(
      trade,
      {
        eos: account.eos,
        networkAccount: NETWORK_ACCOUNT,
        userAccount: account.account.name,
        userAuthority: account.account.authority,
        srcAmount: sourceAmount,
        srcPrecision: sourceToken.precision,
        srcTokenAccount: sourceToken.account,
        srcSymbol: sourceToken.name,
        destPrecision: destToken.precision,
        destSymbol: destToken.name,
        destTokenAccount: destToken.account,
        destAccount: account.account.name,
        maxDestAmount: MAX_DEST_AMOUNT,
        minConversionRate: MIN_CONVERSION_RATE,
        walletId: account.account.name,
        hint: ""
      }
    );

    yield put(swapActions.setTxConfirming(false));
    yield put(swapActions.setTxBroadcasting(true));
    yield call(delay, 1000);
    yield put(swapActions.setTxBroadcasting(false));
    yield put(swapActions.setTxId(result.transaction_id));
    yield put(accountActions.fetchBalance());
    yield call(delay, 5000);
    yield put(swapActions.resetTx());
  } catch (e) {
    yield put(swapActions.resetTx());

    if (e.message) {
      yield put(swapActions.setTxError(e.message));
    } else {
      const error = JSON.parse(e);
      if (error.error.details[0]) {
        yield put(swapActions.setTxError(error.message + ": " + error.error.details[0].message));
      } else {
        yield put(swapActions.setTxError(error.error.what));
      }
    }

    yield call(delay, 3000);
    yield put(swapActions.setTxError(''));
  }
}

function* fetchTokenPairRate() {
  const swap = yield select(getSwapState);
  const tokens = yield select(getTokens);
  const account = yield select(getAccountState);
  const sourceToken = tokens.find((token) => token.name === swap.sourceToken);
  const sourceAmount = swap.sourceAmount ? swap.sourceAmount : 1;
  const isValidInput = yield call(validateValidInput, swap, sourceToken);

  if (!isValidInput) return;

  yield put(swapActions.setTokenPairRateLoading(true));

  try {
    const tokenPairRate = yield call(
      getRate,
      getRateParams(account.eos, swap.sourceToken, swap.destToken, sourceAmount)
    );

    if (!tokenPairRate) {
      yield put(swapActions.setError('Your source amount is invalid or way too much for us to handle the swap'));
    }

    yield put(swapActions.setDestAmount(tokenPairRate * sourceAmount));
    yield put(swapActions.setTokenPairRate(tokenPairRate));
  } catch (e) {
    console.log(e);
  }

  yield put(swapActions.setTokenPairRateLoading(false));
}

function getRateParams(eos, srcSymbol, destSymbol, srcAmount) {
  return {
    eos: eos,
    srcSymbol: srcSymbol,
    destSymbol: destSymbol,
    srcAmount: srcAmount,
    networkAccount: NETWORK_ACCOUNT,
    eosTokenAccount: EOS_TOKEN.account
  };
}

function* validateValidInput(swap, sourceToken) {
  const sourceAmount = swap.sourceAmount;
  const sourceTokenDecimals = sourceToken.precision;
  const sourceAmountDecimals = sourceAmount.split(".")[1];

  yield put(swapActions.setError(''));

  if (sourceAmount !== '' && !sourceAmount) {
    return false;
  }

  if (sourceAmountDecimals && sourceAmountDecimals.length > sourceTokenDecimals) {
    yield put(swapActions.setError(`Your source amount's decimals should be no longer than ${sourceTokenDecimals} characters`));
    yield put(swapActions.setTokenPairRateLoading(false));
    return false;
  }

  if (swap.sourceToken === swap.destToken) {
    yield put(swapActions.setTokenPairRate(1));
    yield put(swapActions.setDestAmount(sourceAmount));
    return false;
  }

  if (sourceAmount > sourceToken.balance) {
    yield put(swapActions.setError('Your source amount is bigger than your real balance'));
    yield put(swapActions.setTokenPairRateLoading(false));
    return false;
  }

  return true;
}

export default function* swapWatcher() {
  yield takeLatest(swapActions.swapActionTypes.SWAP_TOKEN, swapToken);
  yield takeLatest(swapActions.swapActionTypes.FETCH_TOKEN_PAIR_RATE, fetchTokenPairRate);
  yield takeLatest(swapActions.swapActionTypes.SET_SOURCE_TOKEN, fetchTokenPairRate);
  yield takeLatest(swapActions.swapActionTypes.SET_DEST_TOKEN, fetchTokenPairRate);
  yield takeLatest(swapActions.swapActionTypes.SET_SOURCE_AMOUNT, fetchTokenPairRate);
}
