import { Service, Inject } from "rakkit";
import { AccountModel } from "../models";
import { InstagramService } from "./InstagramService";
import { UserService } from "./UserService";
import { IStoryResponse, StoryResponse } from "../types";
import { chunk as Chunk } from "lodash";
import { Timing } from "../utils";

@Service()
export class StoryService {
  @Inject()
  private _instagramService: InstagramService;

  @Inject()
  private _userService: UserService;

  private _storyQueryHash: string = "de8017ee0a7c9c45ec4260733d81ea31";
  private _updateInterval = Timing.getTimeInSecond(10);

  constructor() {
  }

  /**
   * Fetch the story of the user and returns all informations
   * @param userId The instagram id of the user
   */
  async fetch(accounts: AccountModel[]): Promise<StoryResponse.ReelsMedia[]> {
    if (accounts.length > 0) {
      try {
        const storyResponse: IStoryResponse = (await this._instagramService.makeRequest(
          this._instagramService.getInstagramQueryUrl(
            this._storyQueryHash, {
              reel_ids: accounts.map((user) => user.UserId),
              precomposed_overlay: false
            }
          )
        )).data;
        return storyResponse.data.reels_media;
      } catch (err) {
        await Timing.waitFor(60);
        return await this.fetch(accounts);
      }
    }
    return [];
  }

  /**
   * Fetch the story each X minutes and sends it to the socket
   */
  async launchUpdate() {
    setTimeout(async () => {
      const accountChunks = Chunk(this._userService.AccountsValues, 100);
      for (const chunk of accountChunks) {
        console.log("USERIDS", chunk.map(account => account.UserId));
        const accounts = chunk.filter((account) =>
          account // .Sockets.length > 0 // Fetch only if a user listen to changes
        );
        const stories = await this.fetch(accounts);
        const storiesIds = stories.map((story) => {
          const user = this._userService.Accounts.get(story.user.id);
          if (user) {
            user.Sockets.map((socket) =>
              socket.emit("story", story)
            );
          }
          return story.items;
        });
        console.log("STORIES", storiesIds);
        // Do not spam to much
        await Timing.waitFor(
          4 + Math.floor(Math.random() * 4)
        );
        console.log(".......................................................");
      }
      this.launchUpdate();
    }, this._updateInterval);
  }
}
