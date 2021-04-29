/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import {createContext, Component} from "react";
import h from "react-hyperscript";
import update from "immutability-helper";
import LocalStorage from "./storage";

const SequenceStratContext = createContext({});

class SequenceStratProvider extends Component {
  constructor(props){
    super(props);
    this.state = {
      showTriangleBars: true,
      showFloodingSurfaces: false,
      sequenceStratOrder: [0,1]
    };

    this.storage = new LocalStorage('sequence-strat');
    const v = this.storage.get();
    if (v == null) { return; }
    this.state = update(this.state, {$merge: v});
  }

  render() {
    const actions = {
      updateState: val=> this.setState(val),
      toggleBooleanState: key=> { return () => {
        const obj = {};
        obj[key] = !this.state[key];
        return this.setState(obj);
      }; }
    };
    const value = {...this.state, actions};
    return h(SequenceStratContext.Provider, {value}, this.props.children);
  }

  componentDidUpdate(prevProps, prevState){
    if (prevState === this.state) { return; }
    return this.storage.set(this.state);
  }
}

const SequenceStratConsumer = SequenceStratContext.Consumer;

export {SequenceStratProvider, SequenceStratConsumer, SequenceStratContext};
