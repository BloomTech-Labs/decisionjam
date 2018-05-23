import React, { Component } from "react";
import "./Decision.css";
import DecisionPost from "./DecisionPost.js";
import DecisionVote from "./DecisionVote.js";
import DecisionReveal from "./DecisionReveal.js";
import axios from "axios";

const ROOT_URL = "http://localhost:8000";

class Decision extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderPage: "post",
      postIsActive: true,
      voteIsActive: false,
      revealIsActive: false,
      decisionCode: props.match.params.id,
      decision: "",
      answersArray: [],
      decisionCreatorId: "",
      currentLoggedInUserId: "",
      voteOver: false,
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token")
      }
    };
  }

  // get question based on code
  componentDidMount() {
    const headers = this.state.headers;
    const decisionCode = this.state.decisionCode;
    axios
      .get(`${ROOT_URL}/api/decision/${decisionCode}`, { headers })
      .then(res => {
        //console.log(res.data.currentLoggedInUserId);
        // console.log("res", res);
        this.setState({
          decision: res.data.decisionText,
          answersArray: res.data.answers.map(x => x.answerText),
          decisionCreatorId: res.data.decisionCreatorId,
          voteOver: res.data.voteOver
        });
        // console.log(
        //   "res.data[0].answers.map(x => x.answerText)",
        //   res.data[0].answers.map(x => x.answerText)
        // );
        // console.log("decisionCreatorId", this.state.decisionCreatorId);
      })
      .catch(error => {
        // console.log("erorr", error.response.data.error);
        this.setState({ decision: error.response.data.error });
      });
    // console.log('decisionCreatorId is ' + this.state.decision);
  }

  onPostButtonClick = () => {
    this.setState({
      renderPage: "post",
      postIsActive: true,
      voteIsActive: false,
      revealIsActive: false
    });
  };

  onVoteButtonClick = () => {
    this.setState({
      renderPage: "vote",
      postIsActive: false,
      voteIsActive: true,
      revealIsActive: false
    });
  };

  onRevealButtonClick = () => {
    this.setState({
      renderPage: "reveal",
      postIsActive: false,
      voteIsActive: false,
      revealIsActive: true,
      voteOver: true
    });

    //todo wrap this axios request in a conditional to stop the update
    // request from firing on every reveal button click , we only need it to reveal once
    // conditional would be ((decisionid == currentLoggedInUserId) && this.state.voteOver == false )
    //but first want to get this working and test

    const voteBodyObject = { voteOver: this.state.voteOver };
    // update the decision making sure the vote is over
    axios
      .put(
        `${ROOT_URL}/api/decision/${this.state.decisionCode}/voteOverUpdate`,
        voteBodyObject
      )
      .then(res => {
        console.log("res.data put", res.data);
      })
      .catch(error => {
        console.log("error.response", error.response);
      });
  };

  render() {
    // console.log("this.state", this.state);
    // console.log("this.props", this.props);
    // console.log("decisionCreatorId", this.state.decisionCreatorId);

    return (
      <div className="decision-container">
        <div className="decision-title">{this.state.decision}</div>
        <div className="decision-code">
          <div className="code-title">Code</div>
          <div className="code-text"> {this.state.decisionCode} </div>
        </div>
        <div className="hr-decisions" />
        <div className="decision-tabs-container">
          <button
            className={this.state.postIsActive ? "active-tab" : "inactive-tab"}
            onClick={this.onPostButtonClick}
          >
            Post
          </button>
          <button
            className={this.state.voteIsActive ? "active-tab" : "inactive-tab"}
            onClick={this.onVoteButtonClick}
            // if there are no answers or vote is over , there is nothing to vote on
            disabled={!(this.state.answersArray || this.state.voteOver)} //answersArray empty, null or lenght 0 is false
          >
            Vote
          </button>
          <button
            //disabled if (decisionCreatorid or Logged in userid empty or if the id's don't match or if the vote is over)
            disabled={
              !(
                (this.state.decisionCreatorId &&
                  this.state.currentLoggedInUserId &&
                  this.state.decisionCreatorId ==
                    this.state.currentLoggedInUserId) ||
                this.state.voteOver
              )
            }
            // disabled={!this.state.decisionCreatorId}
            className={
              this.state.revealIsActive ? "active-tab" : "inactive-tab"
            }
            onClick={this.onRevealButtonClick}
          >
            Reveal
          </button>
        </div>
        <div className="hr-decisions " />
        {(() => {
          switch (this.state.renderPage) {
            // pass decisionCode and decision to components
            case "post":
              return (
                <DecisionPost
                  decisionCode={this.state.decisionCode}
                  decision={this.state.decision}
                  answersArray={this.state.answersArray}
                />
              );
            case "vote":
              return (
                <DecisionVote
                  decisionCode={this.state.decisionCode}
                  decision={this.state.decision}
                  answersArray={this.state.answersArray}
                />
              );
            case "reveal":
              return (
                <DecisionReveal
                  decisionCode={this.state.decisionCode}
                  decision={this.state.decision}
                  answersArray={this.state.answersArray}
                />
              );
            default:
              return (
                <DecisionPost
                  decisionCode={this.state.decisionCode}
                  decision={this.state.decision}
                />
              );
          }
        })()}
      </div>
    );
  }
}

export default Decision;
