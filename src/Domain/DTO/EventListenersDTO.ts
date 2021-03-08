import { EventDTO } from "./EventDTO";
import PromiseB from "bluebird";

export declare type EventListenersDTO = {
  eventId: symbol;
  listener: (args: EventDTO) => PromiseB<void>;
};
