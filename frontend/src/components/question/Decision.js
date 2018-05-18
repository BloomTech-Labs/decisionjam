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
      publicReveal : false,
      userId :'',
      publicRevalButtonText: 'reveal',
    };
  }

  // get question based on code
  componentDidMount() {
    const decisionCode = this.state.decisionCode;
    axios
      .get(`${ROOT_URL}/api/decision/decisionCode/${decisionCode}`)
      .then(res => {
        console.log("res.data", res.data);
        this.setState({
          decision: res.data[0].decisionText,
          answersArray: res.data[0].answers.map(x => x.answerText),
          decisionCreatorId: res.data[0].decisionCreatorId,
          userId : res.data[0].userId,
          publicReveal : res.data[0].publicReveal,
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
      publicReveal : true // now the general public can see the Reveal page but 
                          // Todo :i haven't saved this to the database, need help on this, pat will
                          // create a put decison route and update route url here . we have to trigger
                          // an axios request to set this decision public reveal to true
    });
  };

  onRevealButtonClick1 = () => {
    if (this.state.decisionCreatorId == this.state.userId) {
      if(this.publicRevalButtonText == 'reveal') {
        this.setState({
          renderPage: "reveal",
          postIsActive: false,
          voteIsActive: false,
          revealIsActive: true,
          publicReveal : true,
          publicRevalButtonText : 'sneak peek'
        });

      } else if (this.state.publicRevalButtonText == 'sneak peek') {
        this.setState({
          renderPage: "reveal",
          postIsActive: false,
          voteIsActive: false,
          revealIsActive: true,
          publicReveal : false,  
          publicRevalButtonText : 'reveal',
        });
      }

    } else {  // it's a normal user show them reveal button 
      this.setState({
        renderPage: "reveal",
        postIsActive: false,
        voteIsActive: false,
        revealIsActive: true,
        publicReveal : true // now the general public can see the Reveal page but 
                            // Todo :i haven't saved this to the database, need help on this, pat will
                            // create a put decison route and update route url here . we have to trigger
                            // an axios request to set this decision public reveal to true
      });
    }
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
            // if there are no answers , there is nothing to vote on
            disabled= {!this.state.answersArray}  //answersArray empty, null or lenght 0 is false
          >
            Vote
          </button>
          <button
            disabled={!(this.state.decisionCreatorId == this.state.userId)} // check decision creator id is
                // decision createor the same as the person logged in or it's already been publicly revealed and
                
            className={
              this.state.revealIsActive ? "active-tab" : "inactive-tab"
            }
            onClick={this.onRevealButtonClick1}
          >
            {this.state.publicRevalButtonText}
          </button>
          <button
            disabled={!((this.state.decisionCreatorId == this.state.userId) || this.state.publicReveal)} // check decision creator id is
                // decision createor the same as the person logged in or it's already been publicly revealed and
                // saved on the database as publiclyRevealed
                // todo , when decision creator clicks on reveal for the first time , make them
                // confirm via popup to allow the reveal and then set state on publicReveal
            className={
              this.state.revealIsActive ? "active-tab" : "inactive-tab"
            }
            onClick={this.onRevealButtonClick}
          >
            Reveal
          </button>
        </div>{" "}
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
