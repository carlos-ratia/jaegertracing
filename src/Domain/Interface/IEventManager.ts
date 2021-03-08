import { EventDTO } from "../DTO/EventDTO";
import { EventListenersDTO } from "../DTO/EventListenersDTO";

export interface IEventManager {
  emit(args: { eventDTO: EventDTO }): boolean;
  on(args: { eventListener: EventListenersDTO }): this;
}
