/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51NkjApF3XNMYXkFb39dw2y1uCrQormrlAtlonFwL0Ickt3UgcJBStNZMxk0tuJTU1TsKXUWBfkpeceIQTgsTLp0M00plmXdwBQ'
    );
    // 1. get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout/${tourId}`);
    // 2. create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
