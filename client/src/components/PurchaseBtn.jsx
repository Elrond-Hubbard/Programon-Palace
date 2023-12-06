import React from "react";
import userAPI from "../utils/userAPI";

export default function PurchaseBtn(props) {
  const handlePurchase = (userId, cardId) => {
    userAPI.addUserCard(userId, cardId);
  };

  return (
    <div className="button-container">
      <button
        className="rounded purchase-button"
        onClick={() =>
          handlePurchase(props.currentUser._id, props.creature._id)
        }
      >
        Purchase for {props.creature.coinCost} coins
      </button>
    </div>
  );
}
