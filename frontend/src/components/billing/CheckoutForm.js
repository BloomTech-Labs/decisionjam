import React, { Component } from "react";
import { injectStripe } from "react-stripe-elements";
import "./Billing.css";
import CardSection from "./CardSection";
import axios from "axios";
import { Redirect } from "react-router-dom";

const ROOT_URL = "http://localhost:8000";

class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      selectedOption: props.plan.params.id,
      success: false,
      fail: false,
      jwtToken: localStorage.getItem("token")
    };
  }

  handleSubmit = e => {
    // console.log("confirmed button clicked")

    e.preventDefault();

    this.props.stripe
      .createToken({ user: this.state.name })
      .then(({ token }) => {
        const postData = {
          selectedOption: this.state.selectedOption,
          stripeToken: token
        };
        const headers = {
          "Content-Type": "application/json",
          Authorization: this.state.jwtToken
        };
        axios
          .post(`${ROOT_URL}/api/payment`, { postData }, { headers })
          .then(response => {
            console.log("response.data", response.data);
            if (response.data.success) {
              this.setState({
                success: true,
                fail: false
              });
            } else {
              this.setState({ fail: true, success: false });
            }
          });
        // console.log("Received Stripe token:", token);
      });
  };

  handleOptionChange = changeEvent => {
    this.setState({
      selectedOption: changeEvent.target.value
    });
  };

  render() {
    // console.log("this.state:", this.state);
    console.log("this.props:", this.props);

    const planID = this.props.plan.params.id;
    const success = this.state.success;
    const fail = this.state.fail;
    const jwtToken = this.state.jwtToken;

    if (!this.state.jwtToken) {
      return <Redirect to="/signup" />;
    }

    if (success) {
      return <div>Success</div>;
    }

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <CardSection />
          <div className="radiobuttons">
            <label>
              <input
                type="radio"
                value="Monthly"
                checked={this.state.selectedOption === "Monthly"}
                onChange={this.handleOptionChange}
              />
              Monthly
            </label>
            <label>
              <input
                type="radio"
                value="HalfYearly"
                checked={this.state.selectedOption === "HalfYearly"}
                onChange={this.handleOptionChange}
              />
              6 Months
            </label>
            <label>
              <input
                type="radio"
                value="Yearly"
                checked={this.state.selectedOption === "Yearly"}
                onChange={this.handleOptionChange}
              />
              Yearly
            </label>
          </div>
          <button>Confirm order</button>
        </form>

        <div>{success ? "Charge Successful" : ""}</div>
        <div>{fail ? "Charge Failed" : ""}</div>
      </div>
    );
  }
}

export default injectStripe(CheckoutForm);
