import { Http, Response } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import {
  CONFIG,
  ExceptionService,
  MessageService,
  SpinnerService
} from '../core';
import { Character } from './character.model';

let charactersUrl = CONFIG.baseUrls.characters;

@Injectable()
export class CharacterService {
  onDbReset = this.messageService.state;

  constructor(
    private http: Http,
    private exceptionService: ExceptionService,
    private messageService: MessageService,
    private spinnerService: SpinnerService
  ) {
    this.messageService.state.subscribe(state => this.getCharacters());
  }

  addCharacter(character: Character) {
    let body = JSON.stringify(character);
    this.spinnerService.show();
    return <Observable<Character>>this.http.post(`${charactersUrl}`, body).pipe(
      map(res => res.json().data),
      catchError(this.exceptionService.catchBadResponse),
      finalize(() => this.spinnerService.hide())
    );
  }

  deleteCharacter(character: Character) {
    this.spinnerService.show();
    return <Observable<Character>>(
      this.http.delete(`${charactersUrl}/${character.id}`).pipe(
        map(res => this.extractData<Character>(res)),
        catchError(this.exceptionService.catchBadResponse),
        finalize(() => this.spinnerService.hide())
      )
    );
  }

  getCharacters() {
    this.spinnerService.show();
    return <Observable<Character[]>>this.http.get(charactersUrl).pipe(
      map(res => {
        const x = this.extractData<Character[]>(res);
        return this.extractData<Character[]>(res);
      }),
      catchError(this.exceptionService.catchBadResponse),
      finalize(() => this.spinnerService.hide())
    );
  }

  getCharacter(id: number) {
    this.spinnerService.show();
    return <Observable<Character>>this.http.get(`${charactersUrl}/${id}`).pipe(
      map(res => this.extractData<Character>(res)),
      catchError(this.exceptionService.catchBadResponse),
      finalize(() => this.spinnerService.hide())
    );
  }

  updateCharacter(character: Character) {
    let body = JSON.stringify(character);
    this.spinnerService.show();

    return <Observable<Character>>(
      this.http.put(`${charactersUrl}/${character.id}`, body).pipe(
        map(res => this.extractData<Character>(res)),
        catchError(this.exceptionService.catchBadResponse),
        finalize(() => this.spinnerService.hide())
      )
    );
  }

  private extractData<T>(res: Response) {
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }
    let body = res.json ? res.json() : null;
    return <T>((body && body.data) || {});
  }
}
