import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Application,
  ApplicationCreateRequest,
  ApplicationFilters,
  ApplicationUpdateRequest,
  Page
} from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/applications`;

  findAll(page = 0, size = 10, sort = 'createdAt,desc'): Observable<Page<Application>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    return this.http.get<Page<Application>>(this.baseUrl, { params });
  }

  findById(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.baseUrl}/${id}`);
  }

  create(request: ApplicationCreateRequest): Observable<Application> {
    return this.http.post<Application>(this.baseUrl, request);
  }

  update(id: string, request: ApplicationUpdateRequest): Observable<Application> {
    return this.http.put<Application>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  search(filters: ApplicationFilters, page = 0, size = 10): Observable<Page<Application>> {
  let params = new HttpParams()
    .set('page', page)
    .set('size', size)
    .set('sortBy', 'createdAt')
    .set('sortDir', 'desc');

  if (filters.keyword)  params = params.set('keyword', filters.keyword);
  if (filters.company)  params = params.set('company', filters.company);
  if (filters.status)   params = params.set('status',  filters.status);

  return this.http.get<Page<Application>>(`${this.baseUrl}/search`, { params });
}
}