package com.jobtracker.mapper;

import com.jobtracker.dto.request.ApplicationCreateRequest;
import com.jobtracker.dto.request.ApplicationUpdateRequest;
import com.jobtracker.dto.response.ApplicationResponse;
import com.jobtracker.entity.Application;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ApplicationMapper {

    ApplicationResponse toResponse(Application application);

    Application toEntity(ApplicationCreateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(ApplicationUpdateRequest request, @MappingTarget Application application);
}