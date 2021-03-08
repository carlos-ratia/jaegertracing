import { ContainerInterface } from "../Interface/ContainerInterface";
import { EventListenersDTO } from "../../Domain/DTO/EventListenersDTO";
import { CONTAINER_ENTRY_IDENTIFIER } from "../Dependencies";
import { IEventManager } from "../../Domain/Interface/IEventManager";

const EVENT_DOMAIN_IDENTIFIER = {};

const EventDomainManager = (container: ContainerInterface) => {
  const eventListeners: EventListenersDTO[] = [];

  const eventManager: IEventManager = container.get(
    CONTAINER_ENTRY_IDENTIFIER.IEventManager
  );

  eventListeners.forEach((eventListener: EventListenersDTO) => {
    eventManager.on({
      eventListener: eventListener,
    });
  });
};

export { EventDomainManager, EVENT_DOMAIN_IDENTIFIER };
